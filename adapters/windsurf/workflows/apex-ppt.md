---
name: ppt
description: "[PPT] Create PowerPoint presentations via OfficeCLI (apex-ppt)"
workflow:
  steps:
    - name: create
      description: Generate a PowerPoint presentation
      command: npx office-cli ppt create --path "output.pptx" --title "Presentation Title"
    - name: edit
      description: Edit an existing presentation
      command: npx office-cli ppt edit --path "presentation.pptx"

## Examples
- "Create a pitch deck with 5 slides: title, problem, solution, market, team"
- "Generate a quarterly review presentation from the data in report.json"
- "Create a training presentation with slide transitions and speaker notes"
---
