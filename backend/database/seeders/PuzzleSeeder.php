<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PuzzleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $puzzles = [
            [
                'type' => 'symbol_cipher',
                'sequence_order' => 1,
                'title' => 'El Cifrado de los Antiguos',
                'description' => 'Decodifica los símbolos lovecraftianos para revelar la palabra oculta.',
                'solution_data' => json_encode([
                    'solution' => 'CTHULHU',
                    'symbols' => ['☥', '⚝', '⛧', '⚛', '⚕', '⚚', '⚡']
                ]),
            ],
            [
                'type' => 'ritual_pattern',
                'sequence_order' => 2,
                'title' => 'El Ritual Prohibido',
                'description' => 'Ordena los items rituales en la secuencia correcta para completar el ritual.',
                'solution_data' => json_encode([
                    'solution' => ['candle', 'tome', 'dagger', 'chalice', 'skull'],
                    'items' => ['candle', 'tome', 'dagger', 'chalice', 'skull']
                ]),
            ],
            [
                'type' => 'ancient_lock',
                'sequence_order' => 3,
                'title' => 'La Cerradura Ancestral',
                'description' => 'Resuelve la combinación basándote en las pistas del entorno.',
                'solution_data' => json_encode([
                    'solution' => '7394',
                    'clues' => [
                        'Los tentáculos del horror',
                        'Los ángulos de la locura',
                        'Los ojos del abismo',
                        'Las estrellas alineadas'
                    ]
                ]),
            ],
            [
                'type' => 'memory_fragments',
                'sequence_order' => 4,
                'title' => 'Fragmentos de Memoria',
                'description' => 'Empareja las imágenes eldritchas antes de que la locura te consuma.',
                'solution_data' => json_encode([
                    'pairs' => 8,
                    'time_limit' => 120,
                    'images' => ['tentacle', 'eye', 'star', 'tome', 'portal', 'cultist', 'monster', 'rune']
                ]),
            ],
            [
                'type' => 'cosmic_alignment',
                'sequence_order' => 5,
                'title' => 'Alineación Cósmica',
                'description' => 'Alinea los cuerpos celestes para que coincidan con la carta estelar antigua.',
                'solution_data' => json_encode([
                    'solution' => ['aldebaran', 'betelgeuse', 'rigel', 'sirius', 'vega'],
                    'positions' => [
                        ['x' => 120, 'y' => 80],
                        ['x' => 200, 'y' => 150],
                        ['x' => 300, 'y' => 100],
                        ['x' => 180, 'y' => 220],
                        ['x' => 280, 'y' => 180]
                    ]
                ]),
            ],
            [
                'type' => 'tentacle_maze',
                'sequence_order' => 6,
                'title' => 'El Laberinto de Tentáculos',
                'description' => 'Navega a través del laberinto cambiante evitando los tentáculos.',
                'solution_data' => json_encode([
                    'maze_size' => 10,
                    'tentacles' => 5,
                    'exit' => ['x' => 9, 'y' => 9],
                    'start' => ['x' => 0, 'y' => 0]
                ]),
            ],
            [
                'type' => 'forbidden_tome',
                'sequence_order' => 7,
                'title' => 'El Tomo Prohibido',
                'description' => 'Reconstruye las páginas desgarradas del libro antiguo en el orden correcto.',
                'solution_data' => json_encode([
                    'solution' => [3, 1, 4, 2, 5],
                    'pages' => [
                        'En el principio, los Antiguos...',
                        'Desde más allá de las estrellas...',
                        'El ritual debe completarse cuando...',
                        'Los sellos que los mantienen...',
                        'Y así, el mundo conocerá...'
                    ]
                ]),
            ],
            [
                'type' => 'shadow_reflection',
                'sequence_order' => 8,
                'title' => 'Reflejo de Sombras',
                'description' => 'Refleja los movimientos para que coincidan con los patrones de sombras en la pared.',
                'solution_data' => json_encode([
                    'solution' => ['up', 'right', 'down', 'left', 'up', 'up', 'right'],
                    'pattern_count' => 7
                ]),
            ],
            [
                'type' => 'cultist_code',
                'sequence_order' => 9,
                'title' => 'El Código del Culto',
                'description' => 'Decodifica los mensajes interceptados usando análisis de frecuencia.',
                'solution_data' => json_encode([
                    'solution' => 'NECRONOMICON',
                    'encrypted' => 'QHFURQRPLFRQ',
                    'cipher_type' => 'caesar',
                    'shift' => 3
                ]),
            ],
            [
                'type' => 'elder_sign',
                'sequence_order' => 10,
                'title' => 'El Signo de los Antiguos',
                'description' => 'Traza el patrón geométrico complejo sin levantar el cursor.',
                'solution_data' => json_encode([
                    'points' => [
                        ['x' => 200, 'y' => 100],
                        ['x' => 300, 'y' => 200],
                        ['x' => 200, 'y' => 300],
                        ['x' => 100, 'y' => 200],
                        ['x' => 200, 'y' => 100]
                    ],
                    'tolerance' => 20,
                    'max_time' => 60
                ]),
            ],
        ];

        foreach ($puzzles as $puzzle) {
            DB::table('puzzles')->insert(array_merge($puzzle, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Create hints for each puzzle
        $this->createHints();
    }

    /**
     * Create hints for all puzzles
     */
    private function createHints(): void
    {
        $hints = [
            // Puzzle 1: Symbol Cipher
            [
                ['puzzle_id' => 1, 'level' => 1, 'content' => 'Cada símbolo representa una letra. Busca patrones repetidos.'],
                ['puzzle_id' => 1, 'level' => 2, 'content' => 'El primer símbolo es "C". Intenta descifrar el resto.'],
                ['puzzle_id' => 1, 'level' => 3, 'content' => 'La palabra es el nombre del Gran Antiguo que duerme en R\'lyeh.'],
            ],
            // Puzzle 2: Ritual Pattern
            [
                ['puzzle_id' => 2, 'level' => 1, 'content' => 'El ritual comienza con luz y termina con muerte.'],
                ['puzzle_id' => 2, 'level' => 2, 'content' => 'La vela va primero, el cráneo va último.'],
                ['puzzle_id' => 2, 'level' => 3, 'content' => 'Orden: Vela, Tomo, Daga, Cáliz, Cráneo.'],
            ],
            // Puzzle 3: Ancient Lock
            [
                ['puzzle_id' => 3, 'level' => 1, 'content' => 'Cuenta los elementos mencionados en cada pista.'],
                ['puzzle_id' => 3, 'level' => 2, 'content' => 'Tentáculos: 7, Ángulos: 3, Ojos: 9, Estrellas: 4.'],
                ['puzzle_id' => 3, 'level' => 3, 'content' => 'La combinación es: 7394.'],
            ],
            // Puzzle 4: Memory Fragments
            [
                ['puzzle_id' => 4, 'level' => 1, 'content' => 'Memoriza las posiciones antes de que se volteen.'],
                ['puzzle_id' => 4, 'level' => 2, 'content' => 'Empieza por las esquinas, son más fáciles de recordar.'],
                ['puzzle_id' => 4, 'level' => 3, 'content' => 'Hay 8 pares. Concéntrate en un área a la vez.'],
            ],
            // Puzzle 5: Cosmic Alignment
            [
                ['puzzle_id' => 5, 'level' => 1, 'content' => 'Las estrellas deben formar la constelación correcta.'],
                ['puzzle_id' => 5, 'level' => 2, 'content' => 'Aldebaran va en la parte superior izquierda.'],
                ['puzzle_id' => 5, 'level' => 3, 'content' => 'Sigue el patrón de la carta estelar en el fondo.'],
            ],
            // Puzzle 6: Tentacle Maze
            [
                ['puzzle_id' => 6, 'level' => 1, 'content' => 'Los tentáculos se mueven en patrones predecibles.'],
                ['puzzle_id' => 6, 'level' => 2, 'content' => 'Espera a que los tentáculos se retiren antes de avanzar.'],
                ['puzzle_id' => 6, 'level' => 3, 'content' => 'El camino más seguro es por el borde derecho.'],
            ],
            // Puzzle 7: Forbidden Tome
            [
                ['puzzle_id' => 7, 'level' => 1, 'content' => 'Lee el contenido de cada página para encontrar el orden cronológico.'],
                ['puzzle_id' => 7, 'level' => 2, 'content' => 'La página 3 va primero, habla del principio.'],
                ['puzzle_id' => 7, 'level' => 3, 'content' => 'Orden correcto: 3, 1, 4, 2, 5.'],
            ],
            // Puzzle 8: Shadow Reflection
            [
                ['puzzle_id' => 8, 'level' => 1, 'content' => 'Observa el patrón de sombras cuidadosamente.'],
                ['puzzle_id' => 8, 'level' => 2, 'content' => 'El patrón comienza hacia arriba y termina a la derecha.'],
                ['puzzle_id' => 8, 'level' => 3, 'content' => 'Secuencia: Arriba, Derecha, Abajo, Izquierda, Arriba, Arriba, Derecha.'],
            ],
            // Puzzle 9: Cultist Code
            [
                ['puzzle_id' => 9, 'level' => 1, 'content' => 'Es un cifrado César. Cada letra está desplazada.'],
                ['puzzle_id' => 9, 'level' => 2, 'content' => 'El desplazamiento es de 3 posiciones hacia atrás.'],
                ['puzzle_id' => 9, 'level' => 3, 'content' => 'La palabra es el nombre del libro maldito: NECRONOMICON.'],
            ],
            // Puzzle 10: Elder Sign
            [
                ['puzzle_id' => 10, 'level' => 1, 'content' => 'Debes trazar el patrón sin levantar el cursor.'],
                ['puzzle_id' => 10, 'level' => 2, 'content' => 'Comienza desde el punto superior y sigue las líneas.'],
                ['puzzle_id' => 10, 'level' => 3, 'content' => 'Forma una estrella de cinco puntas, comenzando arriba.'],
            ],
        ];

        foreach ($hints as $puzzleHints) {
            foreach ($puzzleHints as $hint) {
                DB::table('hints')->insert(array_merge($hint, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            }
        }
    }
}
