@echo off
setlocal
title AzubiPrep - Webversion
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
  echo AzubiPrep braucht einmalig Node.js ab Version 20.
  echo Bitte Node.js installieren und diese Datei danach erneut oeffnen.
  echo Download: https://nodejs.org/
  pause
  exit /b 1
)
node "%~dp0backend\scripts\start-web.mjs"
if errorlevel 1 pause
