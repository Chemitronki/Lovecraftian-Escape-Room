# 🎮 Lovecraftian Escape Room

Una experiencia de escape room web con temática lovecraftiana oscura y terrorífica. Resuelve 10 puzzles únicos antes de que se agote el tiempo.

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![Laravel](https://img.shields.io/badge/Laravel-10.x-red)
![React](https://img.shields.io/badge/React-18-blue)

## 🌟 Características

- ⏱️ **Timer de 25 minutos** - Carrera contra el tiempo
- 🧩 **10 Puzzles Únicos** - Cada uno con mecánicas diferentes
- 💡 **Sistema de Pistas** - 3 pistas por puzzle (disponibles después de 2 minutos)
- 🏆 **Ranking Global** - Compite por el mejor tiempo
- 🎨 **Tema Lovecraftiano** - Diseño oscuro con efectos visuales y sonoros
- 📱 **Responsive** - Funciona en móvil, tablet y desktop
- 🔒 **Seguro** - Autenticación, validación server-side, protección XSS

## 🚀 Instalación Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Ejecutar instalación
setup-complete.bat

# 2. Crear base de datos MySQL
CREATE DATABASE lovecraftian_escape;

# 3. Configurar backend/.env con tus credenciales de MySQL

# 4. Ejecutar migraciones
migrate-database.bat

# 5. Iniciar servidores
start-servers.bat
```

### Opción 2: Manual

#### Backend (Laravel)
```bash
cd backend
copy .env.example .env
composer install
php artisan key:generate
# Configurar .env con credenciales de base de datos
php artisan migrate:fresh --seed
php artisan serve
```

#### Frontend (React)
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```

## 📋 Requisitos

- PHP 8.1+
- Composer
- Node.js 18+
- MySQL 8.0+
- Laragon (recomendado para Windows)

## 🎯 Cómo Jugar

1. **Regístrate** - Crea una cuenta nueva
2. **Inicia el Juego** - Comienza tu sesión de 25 minutos
3. **Resuelve Puzzles** - 10 puzzles en secuencia
4. **Usa Pistas** - Si te atascas (disponibles después de 2 minutos)
5. **Completa el Juego** - ¡Aparece en el ranking global!

## 🧩 Tipos de Puzzles

1. **Symbol Cipher** - Descifra símbolos lovecraftianos
2. **Ritual Pattern** - Ordena items rituales
3. **Ancient Lock** - Resuelve la combinación
4. **Memory Fragments** - Empareja imágenes
5. **Cosmic Alignment** - Alinea cuerpos celestiales
6. **Tentacle Maze** - Navega evitando tentáculos
7. **Forbidden Tome** - Ordena páginas antiguas
8. **Shadow Reflection** - Replica patrones de sombras
9. **Cultist Code** - Decodifica mensajes cifrados
10. **Elder Sign Drawing** - Traza el signo sin levantar el cursor

## 🛠️ Tecnologías

### Backend
- Laravel 10.x
- Laravel Sanctum (autenticación)
- MySQL
- PHP 8.1+

### Frontend
- React 18
- Redux Toolkit (estado)
- React Router (navegación)
- Axios (HTTP)
- Vite (build)

## 📁 Estructura del Proyecto

```
lovecraftian-escape-room/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/Controllers/  # Controladores API
│   │   ├── Models/            # Modelos Eloquent
│   │   └── Services/          # Lógica de negocio
│   ├── database/
│   │   └── migrations/        # Migraciones
│   └── routes/api.php         # Rutas API
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── auth/         # Login/Register
│   │   │   ├── game/         # Juego y puzzles
│   │   │   ├── ranking/      # Leaderboard
│   │   │   ├── audio/        # Sistema de audio
│   │   │   └── cinematic/    # Cinemáticas
│   │   ├── features/         # Redux slices
│   │   ├── pages/            # Páginas principales
│   │   └── styles/           # CSS global
│   └── public/
│
├── database-migrations/        # Migraciones adicionales
├── setup-complete.bat         # Script de instalación
├── start-servers.bat          # Iniciar servidores
└── migrate-database.bat       # Ejecutar migraciones
```

## 🔧 Configuración

### Backend (.env)
```env
DB_DATABASE=lovecraftian_escape
DB_USERNAME=root
DB_PASSWORD=

FRONTEND_URL=http://localhost:5173
SANCTUM_STATEFUL_DOMAINS=localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

## 🐛 Solución de Problemas

### Error de conexión a base de datos
```bash
# Verifica que MySQL esté corriendo
# Confirma credenciales en backend/.env
# Asegúrate de que la base de datos existe
```

### Error de CORS
```bash
# Verifica FRONTEND_URL en backend/.env
# Confirma VITE_API_URL en frontend/.env
```

### Limpiar caché
```bash
cd backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## 📊 Base de Datos

### Tablas Principales
- `users` - Usuarios registrados
- `game_sessions` - Sesiones de juego
- `puzzles` - 10 puzzles del juego
- `puzzle_progress` - Progreso por puzzle
- `hints` - 30 pistas (3 por puzzle)
- `rankings` - Tabla de clasificación

## 🎨 Características de Diseño

- **Paleta de colores oscura** - Negro profundo, púrpura eldritch, verde tóxico
- **Efectos de partículas** - Ambiente atmosférico
- **Animaciones suaves** - Transiciones y feedback visual
- **Efectos de sonido** - Audio generado con Web Audio API
- **Cinemáticas** - Opening y victory screens
- **Responsive** - Optimizado para todos los dispositivos

## 🔒 Seguridad

- ✅ Autenticación con Laravel Sanctum
- ✅ Bcrypt para passwords (cost 10+)
- ✅ Rate limiting (5 intentos/minuto)
- ✅ Validación server-side de puzzles
- ✅ Protección XSS
- ✅ Content Security Policy
- ✅ SQL injection prevention (Eloquent ORM)
- ✅ Session timeout (2 horas)

## 📈 Optimizaciones

- Code splitting (React lazy loading)
- Caching de rankings (30 segundos)
- Eager loading en queries
- Bundle optimization con Vite
- Lazy loading de imágenes
- State persistence en localStorage

## 🤝 Contribuir

Este es un proyecto iterable. Si encuentras bugs o tienes sugerencias:

1. Reporta issues
2. Propón mejoras
3. Comparte tu feedback

## 📝 Licencia

Este proyecto es de código abierto creado por Jose Manuel Garcia Seno.

## 👨‍💻 Autor

Desarrollado como proyecto de escape room web con temática lovecraftiana.

---

**¡Disfruta del juego y que los Antiguos te acompañen! 🐙**
