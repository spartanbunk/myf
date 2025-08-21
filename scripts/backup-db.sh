#!/bin/bash

# Database backup script for MYF project
# Creates timestamped backups of the PostgreSQL database

set -e  # Exit on any error

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="db_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
echo "Backup file: $BACKUP_FILE"

# Try different database configurations to find the right one
CONFIGS=(
    "myf_user:myf_database"
    "postgres:myf_db" 
    "myf_user:myf_db"
    "postgres:postgres"
    "myf_user:postgres"
)

BACKUP_SUCCESS=false

for config in "${CONFIGS[@]}"; do
    IFS=':' read -r user db <<< "$config"
    echo "Trying: User=$user, Database=$db"
    
    if docker-compose exec -T postgres pg_dump -U "$user" -d "$db" > "$BACKUP_DIR/$BACKUP_FILE" 2>/dev/null; then
        echo "✅ Database backup successful!"
        echo "📁 Backup saved to: $BACKUP_DIR/$BACKUP_FILE"
        echo "🗄️  Database: $db (User: $user)"
        
        # Get file size
        BACKUP_SIZE=$(ls -lh "$BACKUP_DIR/$BACKUP_FILE" | awk '{print $5}')
        echo "📊 Backup size: $BACKUP_SIZE"
        
        BACKUP_SUCCESS=true
        break
    else
        echo "❌ Failed with User=$user, Database=$db"
        # Remove failed backup file if it exists
        rm -f "$BACKUP_DIR/$BACKUP_FILE"
    fi
done

if [ "$BACKUP_SUCCESS" = false ]; then
    echo "🚨 ERROR: All backup attempts failed!"
    echo "Please check database configuration in docker-compose.yml"
    exit 1
fi

# Keep only last 10 backups to save space
echo "🧹 Cleaning up old backups (keeping last 10)..."
ls -t "$BACKUP_DIR"/db_backup_*.sql | tail -n +11 | xargs -r rm -f

echo "✅ Database backup completed successfully!"