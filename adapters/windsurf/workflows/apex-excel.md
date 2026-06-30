---
name: excel
description: "[Excel] Create/edit Excel spreadsheets via OfficeCLI (apex-excel)"
workflow:
  steps:
    - name: create
      description: Generate an Excel spreadsheet
      command: npx office-cli excel create --path "output.xlsx" --data "data.json"
    - name: edit
      description: Edit an existing Excel spreadsheet
      command: npx office-cli excel edit --path "spreadsheet.xlsx"

## Examples
- "Create a budget spreadsheet with income, expenses, and totals"
- "Generate a sales report with charts from CSV data"
- "Create a project timeline with Gantt chart formatting"

The agent handles data structure, formulas, charts, and formatting.
---
