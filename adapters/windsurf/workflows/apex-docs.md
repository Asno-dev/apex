---
name: docs
description: "[Docs] Create/edit Word documents via OfficeCLI (apex-docs)"
workflow:
  steps:
    - name: create
      description: Generate a Word document
      command: npx office-cli document create --path "output.docx" --title "Document Title"
    - name: edit
      description: Edit an existing Word document
      command: npx office-cli document edit --path "document.docx"

## Examples
- "Create a project proposal document with sections for overview, timeline, and budget"
- "Generate a monthly report document from the data in results.json"
- "Create a meeting minutes template with attendees, agenda, and action items"

The agent handles content structure, formatting, and document generation.
---
