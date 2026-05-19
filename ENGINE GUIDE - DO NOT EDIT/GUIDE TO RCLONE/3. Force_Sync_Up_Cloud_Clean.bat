@echo off
title DANGER: Force Sync Up (Cloud Clean Setup)

echo ===================================================
echo STEP 1: RUNNING SAFE SIMULATION (DRY RUN)
echo No files will be changed or deleted yet.
echo ===================================================
echo.

:: Runs the safe test first so you can inspect what would change
rclone sync "D:\Workspace\zee-media-production\R2_Bucket_Media" cloudflare:zee-media-production --fast-list --dry-run --progress

echo.
echo ===================================================
echo SIMULATION COMPLETE! 
echo Review the list above carefully. 
echo If everything looks correct, you can proceed to the LIVE sync.
echo ===================================================
echo.

:confirm
echo WARNING: Proceeding will PERMANENTLY DELETE files on Cloudflare R2!
set /p choice="Type 'RUN' to execute live sync, or 'N' to cancel: "

if "%choice%"=="RUN" goto run_sync
if /i "%choice%"=="N" goto end_sync
echo.
echo Invalid choice. You must type 'RUN' in ALL CAPS to proceed, or 'N' to exit.
echo.
goto confirm

:run_sync
echo.
echo [LIVE MODE] Syncing and purging cloud assets now...
rclone sync "D:\Workspace\zee-media-production\R2_Bucket_Media" cloudflare:zee-media-production --fast-list --progress
echo.
echo Live Sync and Clean Complete!
pause
exit

:end_sync
echo.
echo Operation cancelled safely. No changes were made to your R2 bucket.
pause
exit
