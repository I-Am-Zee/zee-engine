@echo off
:: This script must be run as Administrator to modify system environment variables
:: Check for admin permissions
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ========================================================
    echo ERROR: You must right-click this file and select
    echo "Run as administrator" for this setup to work!
    echo ========================================================
    pause
    exit /b
)

:: FIX: Force the script to look inside the folder where it is running
cd /d "%~dp0"

echo Starting automated Rclone setup...

:: 1. Create the C:\Rclone folder if it doesn't exist
if not exist "C:\Rclone" (
    mkdir "C:\Rclone"
    echo Created folder: C:\Rclone
)

:: 2. Find rclone.exe in the current folder and copy it
if exist "rclone.exe" (
    copy /Y "rclone.exe" "C:\Rclone\" >nul
    echo Successfully moved rclone.exe to C:\Rclone
) else (
    echo ========================================================
    echo ERROR: rclone.exe was not found in this folder!
    echo Current folder path being scanned: %cd%
    echo Please make sure this script is sitting in the exact
    echo same folder as your extracted rclone.exe file.
    echo ========================================================
    pause
    exit /b
)

:: 3. Add C:\Rclone to the System PATH permanently if it isn't already there
echo %PATH% | findstr /I "C:\Rclone" >nul
if %errorLevel% neq 0 (
    setx /M PATH "%PATH%;C:\Rclone"
    echo Successfully added C:\Rclone to your system environment variables!
) else (
    echo C:\Rclone is already present in your environment variables. Skipping...
)

echo.
echo ========================================================
echo SUCCESS: Setup complete! Rclone is now global.
echo You can now close this window and open a fresh CMD.
echo ========================================================
pause
