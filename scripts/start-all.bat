@echo off
setlocal
echo ===========================================
echo       VALUE STRATEGY CONSULTING HUB
echo ===========================================

:: Set the current directory to the script's directory
cd /d "%~dp0"

echo Directorio de Trabajo: %CD%
echo.

echo [1/3] Iniciando Landing Page (apps/dashboard) en puerto 3000...
if exist "..\apps\dashboard" (
    if exist "..\apps\dashboard\package.json" (
        :: Force port 3000
        start "Internal Landing Hub" cmd /k "cd /d ..\apps\dashboard && npm run dev -- -p 3000"
    ) else (
        echo ERROR: El directorio 'apps\dashboard' existe pero falta 'package.json'.
    )
) else (
    echo ERROR: No se encuentra la carpeta 'apps\dashboard'.
)

echo [2/3] Iniciando Orchestrator Beta (Puerto 3001)...
if exist "..\apps\orchestrator" (
    if exist "..\apps\orchestrator\package.json" (
        :: Force port 3001
        start "Orchestrator Beta" cmd /k "cd /d ..\apps\orchestrator && npm run dev -- -p 3001"
    ) else (
        echo ERROR: El directorio 'apps\orchestrator' existe pero falta 'package.json'.
    )
) else (
    echo ERROR: No se encuentra la carpeta 'apps\orchestrator'. Revise la ruta.
)

echo [3/3] Iniciando Lililia (Puerto 3002)...
if exist "..\apps\lililia" (
    if exist "..\apps\lililia\package.json" (
        start "Lililia App" cmd /k "cd /d ..\apps\lililia && npm start"
    ) else (
        echo ERROR: El directorio 'apps\lililia' existe pero falta 'package.json'.
    )
) else (
    echo ERROR: No se encuentra la carpeta 'apps\lililia'. Revise la ruta.
)

echo.
echo ===========================================
echo Si ves errores arriba, verifica las carpetas.
echo Si todo esta bien, abre http://localhost:3000
echo ===========================================
pause
