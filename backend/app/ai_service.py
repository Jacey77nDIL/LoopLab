import httpx
import json
from app.config import settings
from typing import Dict, Any

KIMI_API_URL = "https://api.moonshot.ai/v1/chat/completions"

SYSTEM_PROMPT = """You are an AI game developer agent for a web-based single-file game challenge.
You are tasked with modifying a provided `game.js` built using sections.

RULES:
1. You must update the MINIMAL number of sections needed to fulfill the request.
2. YOU MUST NOT REWRITE unrelated sections.
3. Preserve compatibility with the current runtime.
4. YOU MUST PRESERVE section boundaries and names.
5. You may propose ONE new section ONLY if absolutely needed.
6. YOU MUST OUTPUT valid JSON ONLY. No markdown formatted blocks (e.g. ```json ... ```). NO PROSE OUTSIDE JSON.

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

async def call_kimi_api(user_request: str, full_file_content: str, summaries: str) -> Dict[str, Any]:
    # As an MVP, we send the full file plus summaries or we can just send the full file.
    # The requirement asks to use structured approach. We will send the full file for now since it's a single file, OR we can send sections.
    # For a robust MVP, sending the full file is safer to maintain context for Moonshot/Kimi, 
    # but instructed to update only specific sections.
    
    prompt = f"""
USER REQUEST: {user_request}

CURRENT GAME FILE SECTIONS SUMMARY:
{summaries}

CURRENT GAME FILE CONTENT:
{full_file_content}

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
        "temperature": 0.3
    }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(KIMI_API_URL, headers=headers, json=payload, timeout=60.0)
            response.raise_for_status()
            content = response.json()["choices"][0]["message"]["content"]
            
            # Clean up the output in case it wrapped it in markdown anyway limit:
            content = content.replace("```json", "").replace("```", "").strip()
            
            return json.loads(content)
        except Exception as e:
            # Re-raise or handle locally to display standard error
            raise e
