-- Lovecraftian Escape Room Database
-- Base de datos: lovecraftian_escape

CREATE DATABASE IF NOT EXISTS lovecraftian_escape CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lovecraftian_escape;

-- Tabla de usuarios
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de sesiones de juego
CREATE TABLE game_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    started_at TIMESTAMP NOT NULL,
    time_remaining INT NOT NULL DEFAULT 1500,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    completion_time INT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de puzzles
CREATE TABLE puzzles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50) NOT NULL UNIQUE,
    sequence_order INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    solution_data JSON NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de progreso de puzzles
CREATE TABLE puzzle_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    game_session_id BIGINT UNSIGNED NOT NULL,
    puzzle_id BIGINT UNSIGNED NOT NULL,
    started_at TIMESTAMP NULL,
    time_spent INT NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 0,
    hints_used INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (game_session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de pistas
CREATE TABLE hints (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    puzzle_id BIGINT UNSIGNED NOT NULL,
    level INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (puzzle_id) REFERENCES puzzles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de rankings
CREATE TABLE rankings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    completion_time INT NOT NULL,
    rank INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar 10 puzzles
INSERT INTO puzzles (type, sequence_order, title, description, solution_data, created_at, updated_at) VALUES
('symbol_cipher', 1, 'Cifrado de Símbolos', 'Descifra el mensaje oculto en los símbolos antiguos', '{"symbols": ["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ"], "word": "ANCIENT"}', NOW(), NOW()),
('ritual_pattern', 2, 'Patrón Ritual', 'Ordena los items rituales en la secuencia correcta', '{"items": ["vela_negra", "cuchillo_plata", "libro_maldito", "cenizas"], "order": [0, 2, 1, 3]}', NOW(), NOW()),
('ancient_lock', 3, 'Candado Antiguo', 'Resuelve la combinación de la cerradura ancestral', '{"clues": ["El primer número es el doble de 3", "El segundo es 5 menos que 10", "El tercero es 2+2"], "combination": [6, 5, 4]}', NOW(), NOW()),
('memory_fragments', 4, 'Fragmentos de Memoria', 'Empareja las imágenes de la memoria rota', '{"cards": ["monstruo", "estrella", "océano", "símbolo", "monstruo", "estrella", "océano", "símbolo"], "pairs": 4}', NOW(), NOW()),
('cosmic_alignment', 5, 'Alineación Cósmica', 'Alinea las estrellas según la carta estelar', '{"stars": ["Betelgeuse", "Rigel", "Aldebarán", "Sirius"], "pattern": [0, 2, 1, 3]}', NOW(), NOW()),
('tentacle_maze', 6, 'Laberinto de Tentáculos', 'Navega por el laberinto evitando los tentáculos', '{"grid": [[0,1,0,0,0], [0,1,1,1,0], [0,0,0,1,0], [1,1,0,1,0], [0,0,0,0,0]], "start": [0,0], "end": [4,4]}', NOW(), NOW()),
('forbidden_tome', 7, 'Tomo Prohibido', 'Ordena las páginas del tomo maldito', '{"pages": ["introduccion", "capitulo1", "capitulo2", "conclusion"], "order": [0, 1, 2, 3]}', NOW(), NOW()),
('shadow_reflection', 8, 'Reflejo de Sombras', 'Replica el patrón de sombras en el espejo', '{"pattern": [1, 0, 1, 1, 0], "mirror": [0, 1, 1, 0, 1]}', NOW(), NOW()),
('cultist_code', 9, 'Código de los Cultistas', 'Decodifica el mensaje usando análisis de frecuencia', '{"encoded": "KHOOR", "shift": 3, "decoded": "HELLO"}', NOW(), NOW()),
('elder_sign', 10, 'Dibujo del Signo Anciano', 'Traza el signo sin levantar el cursor', '{"path": [[50,50], [100,100], [50,150], [100,200], [50,250]], "closed": false}', NOW(), NOW());

-- Insertar 30 pistas (3 por puzzle)
INSERT INTO hints (puzzle_id, level, content, created_at, updated_at) VALUES
-- Puzzles 1-3
(1, 1, 'Los símbolos son runas antiguas. Busca el patrón en la secuencia.', NOW(), NOW()),
(1, 2, 'Las runas representan letras. Intenta descifrar la palabra oculta.', NOW(), NOW()),
(1, 3, 'La palabra es "ANCIENT" - los símbolos forman esta palabra.', NOW(), NOW()),
(2, 1, 'Los items rituales deben colocarse en orden de poder.', NOW(), NOW()),
(2, 2, 'Empieza con la vela negra, luego el libro maldito...', NOW(), NOW()),
(2, 3, 'Secuencia correcta: vela_negra, libro_maldito, cuchillo_plata, cenizas.', NOW(), NOW()),
(3, 1, 'Las pistas están escritas en la pared de la habitación.', NOW(), NOW()),
(3, 2, 'Primer número: 6, Segundo número: 5...', NOW(), NOW()),
(3, 3, 'Combinación: 6-5-4. Gira la rueda y pulsa el botón.', NOW(), NOW()),
-- Puzzles 4-6
(4, 1, 'Las cartas están desordenadas. Empieza buscando pares.', NOW(), NOW()),
(4, 2, 'Busca las imágenes idénticas. Hay 4 pares en total.', NOW(), NOW()),
(4, 3, 'Empareja: monstruo-monstruo, estrella-estrella, océano-océano, símbolo-símbolo.', NOW(), NOW()),
(5, 1, 'Las estrellas deben alinearse según la carta estelar.', NOW(), NOW()),
(5, 2, 'Betelgeuse va primero, luego Aldebarán...', NOW(), NOW()),
(5, 3, 'Alineación: Betelgeuse, Aldebarán, Rigel, Sirius.', NOW(), NOW()),
(6, 1, 'El laberinto tiene tentáculos que se mueven.', NOW(), NOW()),
(6, 2, 'Busca el camino más seguro. Evita las zonas rojas.', NOW(), NOW()),
(6, 3, 'Camino: arriba, derecha, derecha, abajo, abajo, derecha.', NOW(), NOW()),
-- Puzzles 7-9
(7, 1, 'Las páginas del tomo están desordenadas.', NOW(), NOW()),
(7, 2, 'Lee el contenido de cada página para encontrar el orden.', NOW(), NOW()),
(7, 3, 'Orden correcto: introduccion, capitulo1, capitulo2, conclusion.', NOW(), NOW()),
(8, 1, 'Las sombras forman un patrón específico.', NOW(), NOW()),
(8, 2, 'El espejo invierte el patrón. Ajusta tus movimientos.', NOW(), NOW()),
(8, 3, 'Patrón: 1,0,1,1,0. Copia exactamente.', NOW(), NOW()),
(9, 1, 'El código usa un cifrado César simple.', NOW(), NOW()),
(9, 2, 'Cada letra está desplazada 3 posiciones.', NOW(), NOW()),
(9, 3, 'KHOOR -> HELLO. Resta 3 a cada letra.', NOW(), NOW()),
-- Puzzles 10
(10, 1, 'Traza el signo siguiendo los puntos.', NOW(), NOW()),
(10, 2, 'No levantes el cursor mientras dibujas.', NOW(), NOW()),
(10, 3, 'Sigue la secuencia de puntos exactamente.', NOW(), NOW());

-- Insertar usuario de prueba (password: test1234)
INSERT INTO users (username, email, password, created_at, updated_at) VALUES
('explorador', 'explorador@lovecraft.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NOW(), NOW());

-- Insertar ranking de prueba
INSERT INTO rankings (user_id, completion_time, rank, created_at, updated_at) VALUES
(1, 1200, 1, NOW(), NOW());
