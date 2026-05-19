@echo off
echo Downloading from Cloudflare R2...
rclone sync cloudflare:zee-media-production "D:\Workspace\zee-media-production\R2_Bucket_Media" --progress
echo.
echo Download Complete!
pause
