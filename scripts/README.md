# MYF Database Backup Scripts

This directory contains database backup scripts for the MYF (My Fishing) project.

## Scripts

### `backup-db.sh` (Linux/Mac/Git Bash)
Bash script for creating PostgreSQL database backups.

**Usage:**
```bash
./scripts/backup-db.sh
```

### `backup-db.bat` (Windows)
Windows batch script for creating PostgreSQL database backups.

**Usage:**
```cmd
scripts\backup-db.bat
```

## Features

- **Auto-detection**: Tries multiple database configurations to find the correct one
- **Timestamped backups**: Creates backups with format `db_backup_YYYYMMDD_HHMMSS.sql`
- **Automatic cleanup**: Keeps only the last 10 backups to save disk space
- **Error handling**: Provides clear success/failure messages
- **Cross-platform**: Works on Windows, Linux, and Mac

## Backup Location

All backups are stored in the `backups/` directory in the project root.

## Database Configuration

The scripts automatically try these configurations:
1. `myf_user:myf_database`
2. `postgres:myf_db`
3. `myf_user:myf_db`
4. `postgres:postgres`
5. `myf_user:postgres`

## Requirements

- Docker and docker-compose must be running
- PostgreSQL container must be accessible
- Sufficient disk space for backups

## Troubleshooting

If backups fail:
1. Check that docker-compose is running: `docker-compose ps`
2. Verify PostgreSQL container is healthy: `docker-compose logs postgres`
3. Check database configuration in `docker-compose.yml`

## Automation

To automate backups, you can:

### Linux/Mac (cron):
```bash
# Add to crontab (daily backup at 2 AM)
0 2 * * * cd /path/to/myf && ./scripts/backup-db.sh
```

### Windows (Task Scheduler):
Create a scheduled task that runs `scripts\backup-db.bat` daily.