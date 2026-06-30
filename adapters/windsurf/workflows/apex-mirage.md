---
name: mirage
description: "[Mirage] Virtual filesystem operations via apex-mirage"
workflow:
  steps:
    - name: execute
      description: Execute bash commands across mounted backends
      command: "Usage: /mirage <bash command>"
  commands:
    - "mirage_execute" — Execute bash commands across mounted backends
    - "mirage_workspace_create" — Create new workspace with configured backends
    - "mirage_workspace_snapshot" — Snapshot workspace to tar file
    - "mirage_workspace_load" — Load workspace from snapshot
    - "mirage_provision" — Provision files into workspace
    - "mirage_version" — Check Mirage installation

## Examples
- `apex-mirage ls /s3/` — List files in S3 bucket
- `apex-mirage cp /gdrive/report.pdf /data/` — Copy from Google Drive
- `apex-mirage grep -r error /s3/logs/` — Search across backends
- `apex-mirage cat /slack/channel/messages` — Read Slack messages

## Setup
```bash
pip install mirage-ai
npm install -g @struktoai/mirage-cli
```

## Backends (50+)
S3, GDrive, Slack, Redis, Postgres, MySQL, MongoDB, Dropbox, OneDrive, Box, Azure Blob, GCS, SFTP, and more
---
