import os

files = [
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\actions\DataTransform.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\actions\FileSystem.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\actions\GoogleSheets.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\actions\HttpRequest.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\actions\mail.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\triggers\Schedule.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\triggers\Timer.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\triggers\Trigger.tsx",
    r"c:\Users\HP\Desktop\n8n\apps\client\src\nodes\triggers\Webhook.tsx"
]

for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
        
    if "NodeWrapper" in content:
        continue # skip
        
    content = 'import { NodeWrapper } from "@/component/NodeWrapper";\n' + content
    
    idx = content.find("return (")
    if idx == -1:
        idx = content.find("return(")
        if idx != -1:
            content = content[:idx] + "return (" + content[idx+7:]
            
    idx = content.find("return (")
    if idx != -1:
        content = content[:idx] + "return (\n    <NodeWrapper status={(data as any)?.status}>" + content[idx+8:]
        
        end_idx = content.rfind(")")
        if end_idx != -1:
            content = content[:end_idx] + "    </NodeWrapper>\n  )" + content[end_idx+1:]
            
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {fpath}")
