<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use App\Models\Puzzle;
use App\Models\PuzzleProgress;
use App\Services\PuzzleValidatorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PuzzleController extends Controller
{
    private PuzzleValidatorService $validatorService;

    public function __construct(PuzzleValidatorService $validatorService)
    {
        $this->validatorService = $validatorService;
    }

    /**
     * Get current puzzle for a game session
     * GET /api/puzzles/{sessionId}
     */
    public function getCurrentPuzzle(int $sessionId): JsonResponse
    {
        try {
            $session = GameSession::with('user')->findOrFail($sessionId);

            // Verify session belongs to authenticated user
            if ($session->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                    'errors' => ['You do not have permission to access this session']
                ], 403);
            }

            // Check if session is active
            if ($session->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Session is not active',
                    'errors' => ['This game session has ended']
                ], 400);
            }

            // Get all puzzles in order
            $puzzles = Puzzle::ordered()->get();

            // Find the first incomplete puzzle
            $currentPuzzle = null;
            foreach ($puzzles as $puzzle) {
                $progress = PuzzleProgress::where('game_session_id', $sessionId)
                    ->where('puzzle_id', $puzzle->id)
                    ->first();

                if (!$progress || !$progress->is_completed) {
                    $currentPuzzle = $puzzle;
                    
                    // Create progress record if it doesn't exist
                    if (!$progress) {
                        $progress = PuzzleProgress::create([
                            'game_session_id' => $sessionId,
                            'puzzle_id' => $puzzle->id,
                            'started_at' => now(),
                            'time_spent' => 0,
                            'attempts' => 0,
                            'hints_used' => 0,
                            'is_completed' => false,
                        ]);
                    }
                    
                    break;
                }
            }

            // If no current puzzle, all puzzles are completed
            if (!$currentPuzzle) {
                return response()->json([
                    'success' => true,
                    'message' => 'All puzzles completed',
                    'data' => [
                        'all_completed' => true,
                        'total_puzzles' => $puzzles->count(),
                    ]
                ]);
            }

            // Get progress for current puzzle
            $progress = PuzzleProgress::where('game_session_id', $sessionId)
                ->where('puzzle_id', $currentPuzzle->id)
                ->with('puzzle')
                ->first();

            // Calculate time spent
            $timeSpent = $progress->time_spent;
            if ($progress->started_at && !$progress->completed_at) {
                $timeSpent += now()->diffInSeconds($progress->started_at);
            }

            return response()->json([
                'success' => true,
                'message' => 'Current puzzle retrieved',
                'data' => [
                    'puzzle' => [
                        'id' => $currentPuzzle->id,
                        'type' => $currentPuzzle->type,
                        'sequence_order' => $currentPuzzle->sequence_order,
                        'title' => $currentPuzzle->title,
                        'description' => $currentPuzzle->description,
                        'data' => $this->getPuzzleDataForClient($currentPuzzle),
                    ],
                    'progress' => [
                        'time_spent' => $timeSpent,
                        'attempts' => $progress->attempts,
                        'hints_used' => $progress->hints_used,
                    ],
                    'total_puzzles' => $puzzles->count(),
                    'completed_puzzles' => PuzzleProgress::where('game_session_id', $sessionId)
                        ->where('is_completed', true)
                        ->count(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving puzzle',
                'errors' => [$e->getMessage()]
            ], 500);
        }
    }

    /**
     * Submit a puzzle solution
     * POST /api/puzzles/{puzzleId}/submit
     */
    public function submitSolution(Request $request, int $puzzleId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'session_id' => 'required|integer|exists:game_sessions,id',
                'solution' => 'required',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $sessionId = $request->input('session_id');
            $solution = $request->input('solution');

            $session = GameSession::findOrFail($sessionId);

            // Verify session belongs to authenticated user
            if ($session->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                    'errors' => ['You do not have permission to access this session']
                ], 403);
            }

            // Check if session is active
            if ($session->status !== 'active') {
                return response()->json([
                    'success' => false,
                    'message' => 'Session is not active',
                    'errors' => ['This game session has ended']
                ], 400);
            }

            // Check if time has run out
            if ($session->time_remaining <= 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Time has run out',
                    'errors' => ['The game timer has expired']
                ], 400);
            }

            $puzzle = Puzzle::findOrFail($puzzleId);

            // Get or create progress record
            $progress = PuzzleProgress::firstOrCreate(
                [
                    'game_session_id' => $sessionId,
                    'puzzle_id' => $puzzleId,
                ],
                [
                    'started_at' => now(),
                    'time_spent' => 0,
                    'attempts' => 0,
                    'hints_used' => 0,
                    'is_completed' => false,
                ]
            );

            // Check if puzzle is already completed
            if ($progress->is_completed) {
                return response()->json([
                    'success' => false,
                    'message' => 'Puzzle already completed',
                    'errors' => ['This puzzle has already been solved']
                ], 400);
            }

            // Validate solution
            $isCorrect = $this->validatorService->validate(
                $puzzle->type,
                $solution,
                $puzzle->solution_data
            );

            // Update attempts
            $progress->attempts += 1;

            // Calculate time spent
            if ($progress->started_at) {
                $progress->time_spent += now()->diffInSeconds($progress->started_at);
                $progress->started_at = now(); // Reset for next attempt
            }

            if ($isCorrect) {
                // Mark puzzle as completed
                $progress->is_completed = true;
                $progress->completed_at = now();
                $progress->save();

                // Check if all puzzles are completed
                $totalPuzzles = Puzzle::count();
                $completedPuzzles = PuzzleProgress::where('game_session_id', $sessionId)
                    ->where('is_completed', true)
                    ->count();

                $allCompleted = $completedPuzzles === $totalPuzzles;

                return response()->json([
                    'success' => true,
                    'message' => 'Correct solution!',
                    'data' => [
                        'correct' => true,
                        'puzzle_completed' => true,
                        'all_puzzles_completed' => $allCompleted,
                        'completed_puzzles' => $completedPuzzles,
                        'total_puzzles' => $totalPuzzles,
                    ]
                ]);
            } else {
                // Incorrect solution
                $progress->save();

                return response()->json([
                    'success' => true,
                    'message' => 'Incorrect solution',
                    'data' => [
                        'correct' => false,
                        'feedback' => $this->getFeedbackForIncorrectSolution($puzzle->type),
                        'attempts' => $progress->attempts,
                    ]
                ]);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error submitting solution',
                'errors' => [$e->getMessage()]
            ], 500);
        }
    }

    /**
     * Get puzzle progress
     * GET /api/puzzles/{puzzleId}/progress
     */
    public function getProgress(Request $request, int $puzzleId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'session_id' => 'required|integer|exists:game_sessions,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 400);
            }

            $sessionId = $request->input('session_id');
            $session = GameSession::findOrFail($sessionId);

            // Verify session belongs to authenticated user
            if ($session->user_id !== auth()->id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                    'errors' => ['You do not have permission to access this session']
                ], 403);
            }

            $progress = PuzzleProgress::where('game_session_id', $sessionId)
                ->where('puzzle_id', $puzzleId)
                ->first();

            if (!$progress) {
                return response()->json([
                    'success' => false,
                    'message' => 'Progress not found',
                    'errors' => ['No progress found for this puzzle']
                ], 404);
            }

            // Calculate current time spent
            $timeSpent = $progress->time_spent;
            if ($progress->started_at && !$progress->completed_at) {
                $timeSpent += now()->diffInSeconds($progress->started_at);
            }

            return response()->json([
                'success' => true,
                'message' => 'Progress retrieved',
                'data' => [
                    'puzzle_id' => $progress->puzzle_id,
                    'is_completed' => $progress->is_completed,
                    'time_spent' => $timeSpent,
                    'attempts' => $progress->attempts,
                    'hints_used' => $progress->hints_used,
                    'started_at' => $progress->started_at,
                    'completed_at' => $progress->completed_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving progress',
                'errors' => [$e->getMessage()]
            ], 500);
        }
    }

    /**
     * Get puzzle data for client (without solution)
     */
    private function getPuzzleDataForClient(Puzzle $puzzle): array
    {
        $data = $puzzle->solution_data;
        
        // Remove solution from data sent to client
        unset($data['solution']);
        
        return $data;
    }

    /**
     * Get feedback for incorrect solution based on puzzle type
     */
    private function getFeedbackForIncorrectSolution(string $puzzleType): string
    {
        return match ($puzzleType) {
            'symbol_cipher' => 'Los símbolos no coinciden con esa palabra. Intenta descifrar el patrón nuevamente.',
            'ritual_pattern' => 'El orden de los items no es correcto. Recuerda el flujo del ritual.',
            'ancient_lock' => 'La combinación es incorrecta. Revisa las pistas cuidadosamente.',
            'memory_fragments' => 'No has emparejado todas las imágenes correctamente. Intenta de nuevo.',
            'cosmic_alignment' => 'Las estrellas no están alineadas correctamente. Consulta la carta estelar.',
            'tentacle_maze' => 'No has alcanzado la salida. Ten cuidado con los tentáculos.',
            'forbidden_tome' => 'El orden de las páginas no es correcto. Lee el contenido para encontrar la secuencia.',
            'shadow_reflection' => 'El patrón no coincide con las sombras. Observa más cuidadosamente.',
            'cultist_code' => 'La decodificación es incorrecta. Analiza la frecuencia de las letras.',
            'elder_sign' => 'El signo no está trazado correctamente. Asegúrate de no levantar el cursor.',
            default => 'Solución incorrecta. Intenta de nuevo.',
        };
    }
}
