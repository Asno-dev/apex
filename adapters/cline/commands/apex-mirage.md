---
description: "[Mirage] Virtual filesystem operations via apex-mirage"
---

# apex-mirage — Mirage Virtual Filesystem

Executes bash commands across all mounted backends in a Mirage workspace. Supports 50+ backends including S3, Google Drive, Slack, Dropbox, and more.

## Usage

```
apex-mirage ls /s3/
apex-mirage grep -r error /gdrive/logs/
apex-mirage cp /slack/files/report.csv /data/
apex-mirage cat /dropbox/config.yaml
```

## Common Paths

| Mount | Backend |
|-------|---------|
| `/s3/` | Amazon S3 |
| `/gdrive/` | Google Drive |
| `/slack/` | Slack |
| `/dropbox/` | Dropbox |
| `/data/` | Local workspace data |

## Commands

Standard bash syntax is supported: `ls`, `grep`, `cp`, `mv`, `find`, `cat`, `head`, `tail`, etc.
