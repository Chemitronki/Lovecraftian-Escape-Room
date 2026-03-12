@echo off
echo ========================================
echo Lovecraftian Escape Room - Instalacion Completa
echo ========================================
echo.

echo [1/4] Generando clave de aplicacion...
C:\xampp\php\php.exe "C:\Users\Administrador\Desktop\GruteEscape\backend\artisan" key:generate --force

echo.
echo [2/4] Ejecutando migraciones y seeders...
echo (Asegurate de que MySQL este ejecutandose en Laragon/XAMPP)
echo.
C:\xampp\php\php.exe "C:\Users\Administrador\Desktop\GruteEscape\backend\artisan" migrate:fresh --seed

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR: MySQL no esta ejecutandose
    echo ========================================
    echo.
    echo Por favor:
    echo 1. Inicia MySQL desde Laragon/XAMPP
    echo 2. Ejecuta este script de nuevo
    echo.
    pause
    exit /b 1
)

echo.
echo [3/4] Configurando frontend...
cd "C:\Users\Administrador\Desktop\GruteEscape\frontend"
if not exist "node_modules" (
    echo Instalando dependencias de npm...
    npm install
)

echo.
echo [4/4] Configuracion completa!
echo ========================================
echo.
echo Base de datos: lovecraftian_escape
echo Usuario de prueba:
echo   Email: explorador@lovecraft.com
echo   Password: test1234
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Para iniciar los servidores, ejecuta: start-servers.bat
echo.

pause
