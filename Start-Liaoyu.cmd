@echo off
cd /d "%~dp0"
echo Liaoyu Zhice - local preview at http://127.0.0.1:4173
where py >nul 2>&1
if %errorlevel% equ 0 (
    py -3 scripts\serve.py dist
    goto end
)
where python >nul 2>&1
if %errorlevel% equ 0 (
    python scripts\serve.py dist
    goto end
)
where node >nul 2>&1
if %errorlevel% equ 0 (
    node scripts\serve.mjs dist
    goto end
)
echo Please install Python 3.8+ or Node.js, then run this file again.
:end
pause
