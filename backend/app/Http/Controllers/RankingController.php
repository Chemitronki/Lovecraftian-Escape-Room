<?php

namespace App\Http\Controllers;

use App\Models\Ranking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RankingController extends Controller
{
    public function getTop(Request $request)
    {
        $limit = $request->input('limit', 100);
        
        $rankings = Ranking::with('user')
            ->orderBy('completion_time', 'asc')
            ->limit($limit)
            ->get()
            ->map(function ($ranking) {
                return [
                    'rank' => null, // Will be calculated
                    'username' => $ranking->user->username,
                    'completion_time' => $ranking->completion_time,
                    'completed_at' => $ranking->completed_at,
                    'formatted_time' => $this->formatTime($ranking->completion_time)
                ];
            });
        
        // Add rank numbers
        $rankings = $rankings->map(function ($ranking, $index) {
            $ranking['rank'] = $index + 1;
            return $ranking;
        });
        
        return response()->json([
            'rankings' => $rankings
        ]);
    }
    
    public function getUserRank(Request $request, $userId)
    {
        $ranking = Ranking::where('user_id', $userId)->first();
        
        if (!$ranking) {
            // Return 200 with null ranking instead of 404
            return response()->json([
                'rank' => null,
                'username' => null,
                'completion_time' => null,
                'completed_at' => null,
                'formatted_time' => null,
                'message' => 'El usuario no ha completado el juego'
            ], 200);
        }
        
        // Calculate rank
        $rank = Ranking::where('completion_time', '<', $ranking->completion_time)
            ->count() + 1;
        
        return response()->json([
            'rank' => $rank,
            'username' => $ranking->user->username,
            'completion_time' => $ranking->completion_time,
            'completed_at' => $ranking->completed_at,
            'formatted_time' => $this->formatTime($ranking->completion_time)
        ]);
    }
    
    private function formatTime($seconds)
    {
        $minutes = floor($seconds / 60);
        $secs = $seconds % 60;
        return sprintf('%02d:%02d', $minutes, $secs);
    }
}
