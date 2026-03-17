<?php

namespace App\Http\Controllers;

use App\Events\GameCompleted;
use App\Models\GameSession;
use App\Models\Puzzle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameSessionController extends Controller
{
    public function start(Request $request)
    {
        $user = Auth::user();
        
        // Check if user already has an active session
        $activeSession = GameSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
        
        if ($activeSession) {
            return response()->json([
                'message' => 'El usuario ya tiene una sesión activa',
                'session' => $activeSession
            ]);
        }
        
        $session = GameSession::create([
            'user_id' => $user->id,
            'started_at' => now(),
            'time_remaining' => 1500,
            'status' => 'active'
        ]);
        
        // Initialize first puzzle progress
        $firstPuzzle = Puzzle::where('sequence_order', 1)->first();
        if ($firstPuzzle) {
            \App\Models\PuzzleProgress::create([
                'game_session_id' => $session->id,
                'puzzle_id' => $firstPuzzle->id,
                'started_at' => now(),
                'time_spent' => 0,
                'attempts' => 0,
                'hints_used' => 0,
                'is_completed' => false,
            ]);
        }
        
        return response()->json([
            'message' => 'Sesión de juego iniciada',
            'session' => $session
        ], 201);
    }
    
    public function getSession(Request $request)
    {
        $user = Auth::user();
        
        \Log::info('getSession called', [
            'userId' => $user->id,
            'userEmail' => $user->email
        ]);
        
        $session = GameSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
        
        // If no active session, create one
        if (!$session) {
            \Log::info('No active session found, creating new one', [
                'userId' => $user->id
            ]);
            
            $session = GameSession::create([
                'user_id' => $user->id,
                'started_at' => now(),
                'time_remaining' => 1500,
                'status' => 'active'
            ]);
            
            \Log::info('Session created', [
                'sessionId' => $session->id,
                'userId' => $user->id
            ]);
            
            // Initialize first puzzle progress
            $firstPuzzle = Puzzle::where('sequence_order', 1)->first();
            if ($firstPuzzle) {
                \App\Models\PuzzleProgress::create([
                    'game_session_id' => $session->id,
                    'puzzle_id' => $firstPuzzle->id,
                    'started_at' => now(),
                    'time_spent' => 0,
                    'attempts' => 0,
                    'hints_used' => 0,
                    'is_completed' => false,
                ]);
                
                \Log::info('First puzzle progress created', [
                    'sessionId' => $session->id,
                    'puzzleId' => $firstPuzzle->id
                ]);
            }
        }
        
        // Calculate time remaining
        $elapsedSeconds = now()->diffInSeconds($session->started_at);
        $timeRemaining = max(0, 1500 - $elapsedSeconds);
        
        if ($timeRemaining <= 0) {
            $session->update([
                'status' => 'timeout',
                'completed_at' => now()
            ]);
            
            return response()->json([
                'message' => 'La sesión ha expirado',
                'session' => $session
            ]);
        }
        
        \Log::info('getSession returning', [
            'sessionId' => $session->id,
            'timeRemaining' => $timeRemaining
        ]);
        
        return response()->json([
            'session' => $session,
            'time_remaining' => $timeRemaining
        ]);
    }
    
    public function sync(Request $request)
    {
        $user = Auth::user();
        
        $session = GameSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
        
        if (!$session) {
            return response()->json([
                'message' => 'No se encontró sesión activa'
            ], 404);
        }
        
        $elapsedSeconds = now()->diffInSeconds($session->started_at);
        $timeRemaining = max(0, 1500 - $elapsedSeconds);
        
        if ($timeRemaining <= 0) {
            $session->update([
                'status' => 'timeout',
                'completed_at' => now()
            ]);
            
            return response()->json([
                'message' => 'La sesión ha expirado',
                'session' => $session
            ]);
        }
        
        return response()->json([
            'time_remaining' => $timeRemaining
        ]);
    }
    
    public function complete(Request $request)
    {
        $user = Auth::user();
        
        $session = GameSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
        
        if (!$session) {
            return response()->json([
                'message' => 'No se encontró sesión activa'
            ], 404);
        }
        
        $completionTime = now()->diffInSeconds($session->started_at);
        $completedAt = now();
        
        $session->update([
            'status' => 'completed',
            'completed_at' => $completedAt,
            'completion_time' => $completionTime
        ]);
        
        \Log::info('Game completed', [
            'user_id' => $user->id,
            'session_id' => $session->id,
            'completion_time' => $completionTime,
            'completed_at' => $completedAt
        ]);
        
        // Create ranking entry directly instead of using event
        $existingRanking = \App\Models\Ranking::where('user_id', $user->id)->first();
        
        if ($existingRanking) {
            // Only update if new time is better
            if ($completionTime < $existingRanking->completion_time) {
                $existingRanking->update([
                    'completion_time' => $completionTime,
                    'completed_at' => $completedAt,
                ]);
                \Log::info('Ranking updated', [
                    'user_id' => $user->id,
                    'new_time' => $completionTime
                ]);
            }
        } else {
            // Create new ranking entry
            $ranking = \App\Models\Ranking::create([
                'user_id' => $user->id,
                'completion_time' => $completionTime,
                'completed_at' => $completedAt,
            ]);
            \Log::info('Ranking created', [
                'user_id' => $user->id,
                'completion_time' => $completionTime,
                'ranking_id' => $ranking->id
            ]);
        }
        
        // Dispatch event to update ranking (for backwards compatibility)
        GameCompleted::dispatch($session);
        
        return response()->json([
            'message' => 'Juego completado',
            'session' => $session,
            'completion_time' => $completionTime
        ]);
    }
    
    public function abandon(Request $request)
    {
        $user = Auth::user();
        
        $session = GameSession::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();
        
        if (!$session) {
            return response()->json([
                'message' => 'No se encontró sesión activa'
            ], 404);
        }
        
        $session->update([
            'status' => 'abandoned',
            'completed_at' => now()
        ]);
        
        return response()->json([
            'message' => 'Juego abandonado',
            'session' => $session
        ]);
    }
}
