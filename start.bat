@echo off
title SecondBrain - Launcher
color 0A

echo.
echo  ========================================
echo   SecondBrain - Startup Script
echo   ValueStrategy Consulting Hub
echo  ========================================
echo.

set ROOT=%~dp0

:: ─── 1. Ollama ──────────────────────────────────────────────────────────────
echo [1/5] Verificando Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I "ollama.exe" >NUL
if %ERRORLEVEL%==0 (
    echo       Ollama ya esta corriendo.
) else (
    echo       Iniciando Ollama...
    start "" "%LOCALAPPDATA%\Programs\Ollama\ollama.exe" serve
    timeout /t 5 /nobreak >NUL
    echo       Ollama iniciado.
)

:: ─── 2. Matar procesos anteriores (limpieza completa) ──────────────────────
echo [2/5] Limpiando procesos anteriores...

tasklist /FI "IMAGENAME eq ngrok.exe" 2>NUL | find /I "ngrok.exe" >NUL
if %ERRORLEVEL%==0 (
    echo       Cerrando ngrok...
    taskkill /F /IM ngrok.exe >NUL 2>&1
)

echo       Cerrando node en puertos 3000 y 3003...
powershell -Command "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>NUL
powershell -Command "Get-NetTCPConnection -LocalPort 3003 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" 2>NUL

timeout /t 2 /nobreak >NUL
echo       Limpieza completada.

:: ─── 3. SecondBrain Dashboard (port 3000) ───────────────────────────────────
echo [3/5] Iniciando SecondBrain Dashboard (puerto 3000)...
start "SecondBrain Dashboard" cmd /k "title SecondBrain Dashboard [3000] && cd /d %ROOT%apps\dashboard && node server.js"
timeout /t 3 /nobreak >NUL

:: ─── 4. Inteligencia de Correos (port 3003) ────────────────────────────────
echo [4/5] Iniciando Inteligencia de Correos (puerto 3003)...
start "Inteligencia de Correos" cmd /k "title Inteligencia de Correos [3003] && cd /d %ROOT%Inteligencia-de-correos && node server.js"
timeout /t 2 /nobreak >NUL

:: ─── 5. ngrok (tunel unico al Dashboard, proxy incluido) ───────────────────
echo [5/5] Iniciando ngrok (tunel al Dashboard 3000)...
start "ngrok" cmd /k "title ngrok tunnel [3000] && ngrok http 3000"
timeout /t 5 /nobreak >NUL

:: ─── Validacion ─────────────────────────────────────────────────────────────
echo.
echo  Verificando servicios...
echo.

curl -s http://localhost:11434/api/tags >NUL 2>&1
if %ERRORLEVEL%==0 (echo   [OK] Ollama           http://localhost:11434) else (echo   [!!] Ollama           NO RESPONDE)

curl -s http://localhost:3000/health >NUL 2>&1
if %ERRORLEVEL%==0 (echo   [OK] Dashboard         http://localhost:3000) else (echo   [!!] Dashboard         NO RESPONDE - espera unos segundos)

curl -s http://localhost:3003/health >NUL 2>&1
if %ERRORLEVEL%==0 (echo   [OK] Correos           http://localhost:3003) else (echo   [!!] Correos           NO RESPONDE - espera unos segundos)

curl -s http://localhost:4040/api/tunnels >NUL 2>&1
if %ERRORLEVEL%==0 (echo   [OK] ngrok             http://localhost:4040) else (echo   [!!] ngrok             NO RESPONDE - espera unos segundos)

echo.
echo  ========================================
echo   Todo iniciado!
echo  ========================================
echo.
echo   Dashboard local:     http://localhost:3000
echo   Correos local:       http://localhost:3003
echo   Ollama local:        http://localhost:11434
echo   ngrok inspector:     http://localhost:4040
echo.
echo   Una sola URL publica sirve TODO:
echo     - Dashboard:  https://xxxxx.ngrok-free.dev
echo     - Fireflies:  https://xxxxx.ngrok-free.dev/webhook/fireflies
echo     - El Dashboard hace proxy al servicio de correos.
echo.
echo  Presiona cualquier tecla para cerrar este launcher...
pause >NUL
