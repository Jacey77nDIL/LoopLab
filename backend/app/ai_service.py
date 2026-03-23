import httpx
import json
import logging
import re
from app.config import settings
from typing import Dict, Any

logger = logging.getLogger(__name__)

KIMI_API_URL = "https://api.moonshot.ai/v1/chat/completions"

ROUTER_SYSTEM_PROMPT = """You are an intelligent code routing agent.
Your job is to read the user's game modification request and identify which existing codebase sections need to be edited to fulfill it.

RULES:
1. You MUST return strict JSON only. No markdown, no prose.
2. Choose the MINIMAL number of relevant sections (max 3).
3. If the user wants to add a completely new section, return the sections that might need modifications to hook it in (e.g., UPDATE_LOOP or RENDER).

RESPONSE FORMAT:
{
  "sections": ["PLAYER", "PHYSICS_COLLISIONS"]
}
"""

SYSTEM_PROMPT = """You are an AI game developer agent for a web-based single-file game challenge.
You are tasked with modifying a provided `game.js` built using sections.

RULES:
1. You must update the MINIMAL number of sections needed to fulfill the request.
2. YOU MUST NOT REWRITE unrelated sections.
3. Preserve compatibility with the current runtime.
4. YOU MUST PRESERVE section boundaries and names.
5. You may propose ONE new section ONLY if absolutely needed.

CRITICAL JSON RULES:
- You MUST return valid JSON only
- Escape all backslashes properly using double backslashes (\\)
- Do NOT include invalid escape sequences
- Do NOT include markdown or code fences
- Do NOT include any text outside the JSON object
- All strings must be valid JSON strings

RESPONSE FORMAT (Strict JSON):
{
  "updates": [
    {
      "name": "SECTION_NAME",
      "content": "the complete rewritten code for this section including its // === SECTION: NAME === header"
    }
  ],
  "new_sections": [
    {
      "name": "NEW_SECTION_NAME",
      "purpose": "A brief explanation of its purpose",
      "insert_after": "EXISTING_SECTION_NAME",
      "content": "the code for the new section including its header"
    }
  ],
  "summary_for_user": "A short sentence describing what you did."
}

If you do NOT need new sections, leave the array empty `[]`.
"""

def safe_json_parse(raw_content: str) -> Dict[str, Any]:
    # 1. CLEAN RAW RESPONSE
    content = raw_content.strip()
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
        
    first_brace = content.find('{')
    last_brace = content.rfind('}')
    
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        content = content[first_brace:last_brace + 1]
    
    content = content.strip()
    
    # 2. DEFAULT PARSE
    try:
        return json.loads(content)
    except json.JSONDecodeError as base_err:
        logger.warning(f"Initial JSON parse failed: {base_err}. Attempting to fix escape sequences.")
        
        # 3. CONTROLLED RECOVERY FOR MALFORMED ESCAPES
        # This replaces lone backslashes `\` with `\\` UNLESS they are a valid JSON escape
        fixed_content = re.sub(r'\\(?=[^"\\/bfnrtu])', r'\\\\', content)
        
        try:
            return json.loads(fixed_content)
        except json.JSONDecodeError as recovery_err:
            logger.error(f"Failed to parse AI JSON even after recovery. Error: {recovery_err}")
            # Do not log sensitive keys, only print prefix to verify bounds
            logger.debug(f"Raw prefix: {raw_content[:200]}")
            raise ValueError(f"AI service error: Invalid \\escape during JSON parsing. {str(recovery_err)}")

def validate_ai_response(parsed_json: Dict[str, Any]) -> None:
    required_keys = ["updates", "new_sections", "summary_for_user"]
    for key in required_keys:
        if key not in parsed_json:
            raise ValueError(f"AI service error: Missing required key in AI response: '{key}'. Response structure invalid.")
            
    if not isinstance(parsed_json.get("updates"), list):
        raise ValueError("AI service error: 'updates' field must be a list.")
        
    if not isinstance(parsed_json.get("new_sections"), list):
        raise ValueError("AI service error: 'new_sections' field must be a list.")

async def route_prompt_to_sections(user_request: str, summaries: str) -> list[str]:
    prompt = f"USER REQUEST: {user_request}\n\nAVAILABLE SECTIONS (with summaries):\n{summaries}"
    headers = {
        "Authorization": f"Bearer {settings.KIMI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "kimi-k2-turbo-preview",
        "messages": [
            {"role": "system", "content": ROUTER_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 150
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(KIMI_API_URL, headers=headers, json=payload, timeout=30.0)
            response.raise_for_status()
            raw_content = response.json()["choices"][0]["message"]["content"]
            parsed = safe_json_parse(raw_content)
            sections = parsed.get("sections", [])
            if isinstance(sections, list):
                return sections
            return []
    except Exception as e:
        logger.error(f"Router call failed: {e}")
        return []

async def call_kimi_api(user_request: str, full_file_content: str, summaries: str, parsed_sections: list) -> Dict[str, Any]:
    # STAGE 1 - ROUTER
    target_sections = await route_prompt_to_sections(user_request, summaries)
    
    # Validate targeted sections against existing sections
    valid_section_names = {s["name"] for s in parsed_sections} if parsed_sections else set()
    valid_targets = [name for name in target_sections if name in valid_section_names]
    
    logger.info(f"AI Router selected regions: {valid_targets}")
    
    # STAGE 2 - GENERATOR Setup
    if valid_targets and parsed_sections:
        extracted_content = "\n\n".join([s["content"] for s in parsed_sections if s["name"] in valid_targets])
        context_string = f"TARGETED SECTIONS CODE:\n{extracted_content}"
    else:
        # Fallback to full file if router fails or returns gibberish
        context_string = f"CURRENT GAME FILE CONTENT:\n{full_file_content}"
        
    prompt = f"""
USER REQUEST: {user_request}

GAME STRUCTURAL SUMMARIES:
{summaries}

{context_string}

Strictly follow the JSON schema requested in the system prompt.
"""
    headers = {
        "Authorization": f"Bearer {settings.KIMI_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "kimi-k2-turbo-preview",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 800,
        "stream": True
    }

    async with httpx.AsyncClient() as client:
        try:
            raw_content = ""
            async with client.stream("POST", KIMI_API_URL, headers=headers, json=payload, timeout=120.0) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[6:]
                        if data_str.strip() == "[DONE]":
                            break
                        try:
                            chunk_data = json.loads(data_str)
                            delta = chunk_data["choices"][0]["delta"].get("content", "")
                            raw_content += delta
                        except Exception:
                            continue
            
            # Log shortened raw string indicating AI succeeded
            logger.info(f"Received fully buffered AI stream spanning {len(raw_content)} chars.")
            
            parsed_json = safe_json_parse(raw_content)
            validate_ai_response(parsed_json)
            
            return parsed_json
            
        except httpx.HTTPError as h_err:
            logger.error(f"HTTP error communicating with Moonshot: {h_err}")
            raise ValueError("Upstream AI Provider failed to respond.")
