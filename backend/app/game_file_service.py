import re
from typing import Dict, List, Tuple

SECTION_REGEX = re.compile(r"// === SECTION: ([A-Z_]+) ===")

def parse_sections(game_content: str) -> List[Dict[str, str]]:
    """
    Parses the game.js content into a list of sections.
    """
    lines = game_content.splitlines()
    sections = []
    current_name = None
    current_content = []
    
    # We may have some preamble before the first section, let's capture it just in case
    # or assume it strictly starts with sections. Our starter file starts with a section.
    
    for line in lines:
        match = SECTION_REGEX.match(line)
        if match:
            # Save previous section safely
            if current_name is not None:
                sections.append({
                    "name": current_name,
                    "content": "\n".join(current_content)
                })
            current_name = match.group(1)
            current_content = [line] # include the header in the section content
        else:
            if current_name is not None:
                current_content.append(line)
            else:
                # Capture preamble as a special section or just ignore if none exists
                current_name = "PREAMBLE"
                current_content = [line]
                
    if current_name is not None:
        sections.append({
            "name": current_name,
            "content": "\n".join(current_content)
        })
        
    return sections

def patch_game_file(original_content: str, updates: List[Dict[str, str]], new_sections: List[Dict[str, str]]) -> str:
    """
    Applies updates and new sections to the existing game file.
    """
    sections = parse_sections(original_content)
    
    # Apply updates
    for update in updates:
        for i, sec in enumerate(sections):
            if sec["name"] == update["name"]:
                # Ensure the header is preserved if the AI didn't include it
                updated_content = update["content"]
                expected_header = f"// === SECTION: {update['name']} ==="
                if expected_header not in updated_content:
                    updated_content = f"{expected_header}\n{updated_content}"
                sections[i]["content"] = updated_content
                break
                
    # Apply new sections
    for new_sec in new_sections:
        insert_after = new_sec.get("insert_after")
        new_content = new_sec["content"]
        expected_header = f"// === SECTION: {new_sec['name']} ==="
        if expected_header not in new_content:
            new_content = f"{expected_header}\n// {new_sec.get('purpose', '')}\n{new_content}"
            
        inserted = false
        for i, sec in enumerate(sections):
            if sec["name"] == insert_after:
                sections.insert(i + 1, {
                    "name": new_sec["name"],
                    "content": new_content
                })
                inserted = True
                break
        if not inserted:
            # Just append to the end
            sections.append({
                "name": new_sec["name"],
                "content": new_content
            })
            
    # Reassemble
    return "\n\n".join([sec["content"] for sec in sections])

def get_section_summaries(sections: List[Dict[str, str]]) -> str:
    summary = ""
    for sec in sections:
        # Provide the name and maybe the first few lines as a summary
        lines = sec["content"].splitlines()
        first_lines = lines[:4] # header + comments
        summary += "\n".join(first_lines) + "\n...\n\n"
    return summary
