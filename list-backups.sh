#!/bin/bash

# List available backup files for restoration
# This helps you choose which backup to restore from git

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🎣 Mark Your Fish - Available Database Backups${NC}"
echo "=================================================="
echo

echo -e "${GREEN}Available backup files in git repository:${NC}"
echo

# Find all SQL backup files
backup_files=($(find . -name "*.sql" -type f | grep -E "(backup|db_backup)" | sort -r))

if [ ${#backup_files[@]} -eq 0 ]; then
    echo -e "${YELLOW}No backup files found in repository.${NC}"
    echo
    exit 0
fi

# Display numbered list
for i in "${!backup_files[@]}"; do
    file="${backup_files[$i]}"
    size=$(du -h "$file" 2>/dev/null | cut -f1)
    date=$(stat -c %y "$file" 2>/dev/null | cut -d' ' -f1)
    
    echo -e "${GREEN}[$((i+1))]${NC} $file"
    echo "    Size: $size | Date: $date"
    echo
done

echo -e "${BLUE}Usage Examples:${NC}"
echo

echo "# Deploy with latest backup:"
latest_backup="${backup_files[0]}"
echo "./deploy.sh --restore-from-git \"$latest_backup\""
echo

echo "# Deploy with specific backup:"
echo "./deploy.sh --restore-from-git \"backups/db_backup_YYYYMMDD_HHMMSS.sql\""
echo

echo "# Deploy without restoring (fresh install):"
echo "./deploy.sh"
echo

echo -e "${YELLOW}Note: Use --restore-from-git for initial deployment to restore your existing data.${NC}"
echo -e "${YELLOW}      After the first deployment, the script will automatically backup before each deploy.${NC}"