@echo off
REM Database backup script for MYF project (Windows)
REM Creates timestamped backups of the PostgreSQL database

setlocal enabledelayedexpansion

REM Get timestamp
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

REM Configuration
set "BACKUP_DIR=backups"
set "BACKUP_FILE=db_backup_%timestamp%.sql"

REM Create backup directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Starting database backup...
echo Backup file: %BACKUP_FILE%

REM Database configurations to try
set "configs[0]=myf_user:myf_database"
set "configs[1]=postgres:myf_db"
set "configs[2]=myf_user:myf_db"
set "configs[3]=postgres:postgres"
set "configs[4]=myf_user:postgres"

set "BACKUP_SUCCESS=false"

for /L %%i in (0,1,4) do (
    for /f "tokens=1,2 delims=:" %%a in ("!configs[%%i]!") do (
        set "user=%%a"
        set "db=%%b"
        echo Trying: User=!user!, Database=!db!
        
        docker-compose exec -T postgres pg_dump -U "!user!" -d "!db!" > "%BACKUP_DIR%\%BACKUP_FILE%" 2>nul
        if !errorlevel! equ 0 (
            echo ✅ Database backup successful!
            echo 📁 Backup saved to: %BACKUP_DIR%\%BACKUP_FILE%
            echo 🗄️  Database: !db! ^(User: !user!^)
            
            for %%F in ("%BACKUP_DIR%\%BACKUP_FILE%") do echo 📊 Backup size: %%~zF bytes
            
            set "BACKUP_SUCCESS=true"
            goto :backup_complete
        ) else (
            echo ❌ Failed with User=!user!, Database=!db!
            if exist "%BACKUP_DIR%\%BACKUP_FILE%" del "%BACKUP_DIR%\%BACKUP_FILE%"
        )
    )
)

:backup_complete
if "%BACKUP_SUCCESS%"=="false" (
    echo 🚨 ERROR: All backup attempts failed!
    echo Please check database configuration in docker-compose.yml
    exit /b 1
)

echo 🧹 Cleaning up old backups ^(keeping last 10^)...
REM Keep only last 10 backups
for /f "skip=10 delims=" %%F in ('dir /b /o-d "%BACKUP_DIR%\db_backup_*.sql" 2^>nul') do (
    del "%BACKUP_DIR%\%%F" 2>nul
)

echo ✅ Database backup completed successfully!
pause