---
name: apex-mirage
description: "Execute commands across mounted virtual filesystem backends"
---
Virtual filesystem across 50+ backends (S3, GDrive, Slack, etc.).
Usage: apex-mirage ls /s3/ — List files in S3 bucket
       apex-mirage cp /gdrive/report.pdf /data/ — Copy from Google Drive
       apex-mirage grep -r error /s3/logs/ — Search across backends
