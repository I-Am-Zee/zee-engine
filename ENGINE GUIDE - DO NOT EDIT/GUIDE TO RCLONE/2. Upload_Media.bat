@echo off
echo Uploading to Cloudflare R2...
rclone copy "D:\Workspace\zee-media-production\R2_Bucket_Media" cloudflare:zee-media-production --exclude ".gitkeep" --progress
echo.
echo Upload Complete!
pause
