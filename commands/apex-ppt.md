---
description: "[PPT] Create PowerPoint presentations via OfficeCLI (apex-ppt)"
---

## PowerPoint Presentation Creation

Use the OfficeCLI to create and edit Microsoft PowerPoint presentations.

### How to use
Tell the agent what presentation you need. It will run:
```bash
npx office-cli ppt create --path "output.pptx" --title "Presentation Title"
```

### Examples
- "Create a pitch deck with 5 slides: title, problem, solution, market, team"
- "Generate a quarterly review presentation from the data in report.json"
- "Create a training presentation with slide transitions and speaker notes"
