@echo off
chcp 65001 >nul
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\remove-theme-windows.ps1"
if errorlevel 1 pause
