@echo off
setlocal

rem Comprobar si existe la carpeta node_modules
if not exist "node_modules" (
    echo Instalando dependencias...
    call npm install
)

rem Construir la aplicación si no existe la carpeta dist
if not exist "dist" (
    echo Construyendo la aplicación...
    call npm run build
)

echo Iniciando El Rincón del Pescador...
node portable-run.js

pause
