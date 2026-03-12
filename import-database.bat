@echo off
echo ========================================
echo Lovecraftian Escape Room - Importar Base de Datos
echo ========================================
echo.

echo Importando base de datos...
echo.

C:\xampp\mysql\bin\mysql.exe -u root lovecraftian_escape < database-migrations\lovecraftian_escape.sql

if errorlevel 1 (
    echo.
    echo ========================================
    echo ERROR EN LA IMPORTACION
    echo ========================================
    echo.
    echo Verifica que:
    echo 1. MySQL este ejecutandose en Laragon/XAMPP
    echo 2. La base de datos lovecraftian_escape exista
    echo 3. Tengas permisos para importar
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo Base de datos importada exitosamente!
echo ========================================
echo.
echo Se han creado:
echo - Tabla de usuarios
echo - Tabla de sesiones de juego
echo - Tabla de puzzles (10 puzzles)
echo - Tabla de progreso de puzzles
echo - Tabla de pistas (30 pistas)
echo - Tabla de rankings
echo.
echo Usuario de prueba:
echo - Email: explorador@lovecraft.com
echo - Password: test1234
echo.

pause
