<?php

namespace App\Http\Controllers;

use App\Models\GameSession;
use App\Models\Puzzle;
use App\Models\PuzzleProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PuzzleController extends Controller
{
    public function getCurrentPuzzle(Request $request, $sessionId)
    {
        $user = Auth::user();
        
        $session = GameSession::where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();
        
        if (!$session) {
            return response()->json([
                'message' => 'Sesión no encontrada'
            ], 404);
        }
        
        // Get the first incomplete puzzle
        $completedCount = PuzzleProgress::where('game_session_id', $sessionId)
            ->where('is_completed', true)
            ->count();
        
        $currentPuzzle = Puzzle::where('sequence_order', $completedCount + 1)
            ->first();
        
        if (!$currentPuzzle) {
            return response()->json([
                'message' => 'Todos los puzzles han sido completados'
            ], 404);
        }
        
        // Get or create progress record
        $progress = PuzzleProgress::firstOrCreate(
            [
                'game_session_id' => $sessionId,
                'puzzle_id' => $currentPuzzle->id
            ],
            [
                'started_at' => now(),
                'time_spent' => 0,
                'attempts' => 0,
                'hints_used' => 0,
                'is_completed' => false
            ]
        );
        
        return response()->json([
            'puzzle' => $currentPuzzle,
            'progress' => $progress
        ]);
    }
    
    public function submitSolution(Request $request, $puzzleId)
    {
        $user = Auth::user();
        $sessionId = $request->input('session_id');
        
        $session = GameSession::where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();
        
        if (!$session) {
            return response()->json([
                'message' => 'Sesión no encontrada'
            ], 404);
        }
        
        $puzzle = Puzzle::find($puzzleId);
        
        if (!$puzzle) {
            return response()->json([
                'message' => 'Puzzle no encontrado'
            ], 404);
        }
        
        $progress = PuzzleProgress::where('game_session_id', $sessionId)
            ->where('puzzle_id', $puzzleId)
            ->first();
        
        if (!$progress) {
            return response()->json([
                'message' => 'Progreso no encontrado'
            ], 404);
        }
        
        // Increment attempts
        $progress->increment('attempts');
        
        // Validate solution based on puzzle type
        $isCorrect = $this->validateSolution($puzzle, $request->input('solution'));
        
        if ($isCorrect) {
            $progress->update([
                'is_completed' => true,
                'completed_at' => now(),
                'time_spent' => now()->diffInSeconds($progress->started_at)
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Puzzle resuelto correctamente',
                'data' => [
                    'correct' => true,
                    'puzzle_completed' => true,
                    'all_puzzles_completed' => false,
                    'feedback' => '¡Excelente! Has resuelto el puzzle.',
                    'progress' => $progress
                ]
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => 'Solución incorrecta',
            'data' => [
                'correct' => false,
                'feedback' => 'Solución incorrecta. Intenta de nuevo.',
                'attempts' => $progress->attempts
            ]
        ]);
    }
    
    public function getProgress(Request $request, $puzzleId)
    {
        $user = Auth::user();
        $sessionId = $request->input('session_id');
        
        $session = GameSession::where('id', $sessionId)
            ->where('user_id', $user->id)
            ->first();
        
        if (!$session) {
            return response()->json([
                'message' => 'Sesión no encontrada'
            ], 404);
        }
        
        $progress = PuzzleProgress::where('game_session_id', $sessionId)
            ->where('puzzle_id', $puzzleId)
            ->first();
        
        if (!$progress) {
            return response()->json([
                'message' => 'Progreso no encontrado'
            ], 404);
        }
        
        return response()->json([
            'progress' => $progress
        ]);
    }
    
    private function validateSolution($puzzle, $solution)
    {
        try {
            $solutionData = json_decode($puzzle->solution_data, true);
            
            if (!$solutionData) {
                \Log::error('Invalid JSON in puzzle solution_data', [
                    'puzzle_id' => $puzzle->id,
                    'solution_data' => $puzzle->solution_data
                ]);
                return false;
            }
            
            switch ($puzzle->type) {
                case 'symbol_cipher':
                    return strtoupper($solution) === strtoupper($solutionData['solution'] ?? '');
                
                case 'ritual_pattern':
                    return $solution === ($solutionData['solution'] ?? '');
                
                case 'ancient_lock':
                    return $solution === ($solutionData['solution'] ?? '');
                
                case 'memory_fragments':
                    return $solution === true; // Client-side validation
                
                case 'cosmic_alignment':
                    return $solution === ($solutionData['solution'] ?? '');
                
                case 'tentacle_maze':
                    return $solution === true; // Client-side validation
                
                case 'forbidden_tome':
                    return $solution === ($solutionData['solution'] ?? '');
                
                case 'shadow_reflection':
                    return $solution === ($solutionData['solution'] ?? '');
                
                case 'cultist_code':
                    return strtoupper($solution) === strtoupper($solutionData['solution'] ?? '');
                
                case 'elder_sign':
                    return $solution === true; // Client-side validation
                
                default:
                    return false;
            }
        } catch (\Exception $e) {
            \Log::error('Error validating solution', [
                'puzzle_id' => $puzzle->id,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
