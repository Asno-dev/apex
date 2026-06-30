---
description: "[Docs] Create/edit Word documents via OfficeCLI (apex-docs)"
---

> This command can also be invoked as **`apex-docs`**.

## Word Document Creation

Use the OfficeCLI to create and edit Microsoft Word documents.

### How to use
Tell the agent what document you need. It will run:
```bash
npx office-cli document create --path "output.docx" --title "Document Title"
```

### Examples
- "Create a project proposal document with sections for overview, timeline, and budget"
- "Generate a monthly report document from the data in results.json"
- "Create a meeting minutes template with attendees, agenda, and action items"

The agent handles content structure, formatting, and document generation.
