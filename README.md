# 🎮 Lovecraftian Escape Room

> **🕹️ [JUGAR AHORA → lovecraftianescaperoom.vercel.app](https://lovecraftianescaperoom.vercel.app)**

Una experiencia de escape room web con temática lovecraftiana oscura y terrorífica. Resuelve 10 puzzles únicos antes de que se agote el tiempo.

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![React](https://img.shields.io/badge/React-18-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black)

---

## 🌟 Características

- ⏱️ **Timer de 25 minutos** - Carrera contra el tiempo
- 🧩 **10 Puzzles Únicos** - Cada uno con mecánicas diferentes
- 💡 **Sistema de Pistas** - 3 pistas por puzzle (disponibles después de 2 minutos)
- 🏆 **Ranking Global** - Compite por el mejor tiempo
- 🎨 **Tema Lovecraftiano** - Diseño oscuro con efectos visuales y sonoros
- 📱 **Responsive** - Funciona en móvil, tablet y desktop

## 🎯 Cómo Jugar

1. **Regístrate** - Crea una cuenta nueva en [lovecraftianescaperoom.vercel.app](https://lovecraftianescaperoom.vercel.app)
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

- **Frontend**: React 18 + Redux Toolkit + Vite
- **Base de datos**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Auth**: Supabase Auth

## 📁 Estructura del Proyecto

```
lovecraftian-escape-room/
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── auth/         # Login/Register
│   │   │   ├── game/         # Juego y puzzles
│   │   │   ├── ranking/      # Leaderboard
│   │   │   └── cinematic/    # Cinemáticas
│   │   ├── features/         # Redux slices
│   │   ├── lib/              # Servicios Supabase
│   │   └── pages/            # Páginas principales
├── supabase-schema.sql        # Schema de base de datos
└── supabase-data.sql          # Datos iniciales (puzzles y pistas)
```

## 👨‍💻 Autor

Desarrollado por Jose Manuel Garcia Seno.

---

**¡Disfruta del juego y que los Antiguos te acompañen! 🐙**
