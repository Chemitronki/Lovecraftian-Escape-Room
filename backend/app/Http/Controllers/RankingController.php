<?php

namespace App\Http\Controllers;

use App\Services\RankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    protected RankingService $rankingService;

    public function __construct(RankingService $rankingService)
    {
        $this->rankingService = $rankingService;
    }

    /**
     * Get top 100 players from the ranking.
     *
     * @return JsonResponse
     */
    public function getTopPlayers(): JsonResponse
    {
        // Cache for 30 seconds to reduce database load
        $rankings = cache()->remember('rankings_top_100', 30, function () {
            return $this->rankingService->getTopPlayers(100);
        });

        $data = $rankings->map(function ($ranking) {
            return [
                'rank' => $ranking->rank,
                'username' => $ranking->user->username,
                'completion_time' => $ranking->completion_time,
                'formatted_time' => $this->formatTime($ranking->completion_time),
            ];
        });

        return response()->json([
            'success' => true,
            'rankings' => $data,
        ]);
    }

    /**
     * Get user's ranking entry.
     *
     * @param int $userId
     * @return JsonResponse
     */
    public function getUserRank(int $userId): JsonResponse
    {
        $ranking = $this->rankingService->getUserRank($userId);

        if (!$ranking) {
            return response()->json([
                'success' => false,
                'message' => 'Usuario no encontrado en el ranking',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'ranking' => [
                'rank' => $ranking->rank,
                'username' => $ranking->user->username,
                'completion_time' => $ranking->completion_time,
                'formatted_time' => $this->formatTime($ranking->completion_time),
            ],
        ]);
    }

    /**
     * Format time in seconds to MM:SS format.
     *
     * @param int $seconds
     * @return string
     */
    private function formatTime(int $seconds): string
    {
        $minutes = floor($seconds / 60);
        $remainingSeconds = $seconds % 60;
        return sprintf('%02d:%02d', $minutes, $remainingSeconds);
    }
}
