#!/bin/bash

# Comprobar si existe la carpeta node_modules
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Construir la aplicación si no existe la carpeta dist
if [ ! -d "dist" ]; then
    echo "Construyendo la aplicación..."
    npm run build
fi

echo "Iniciando El Rincón del Pescador..."
node portable-run.js
