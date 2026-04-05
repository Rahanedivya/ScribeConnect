@echo off
REM Wrapper to run the root project launcher from the backend directory.
cd ..
if exist "run_project.bat" (
    call "run_project.bat"
) else (
    echo [ERROR] run_project.bat not found in parent directory.
    pause
)
