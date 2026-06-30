---
description: "[Excel] Create/edit Excel spreadsheets via OfficeCLI (apex-excel)"
---

> This command can also be invoked as **`apex-excel`**.

## Excel Spreadsheet Creation

Use the OfficeCLI to create and edit Microsoft Excel spreadsheets.

### How to use
Tell the agent what spreadsheet you need. It will run:
```bash
npx office-cli excel create --path "output.xlsx" --data "data.json"
```

### Examples
- "Create a budget spreadsheet with income, expenses, and totals"
- "Generate a sales report with charts from the CSV data"
- "Create a project timeline with Gantt chart formatting"

The agent handles data structure, formulas, charts, and formatting.
