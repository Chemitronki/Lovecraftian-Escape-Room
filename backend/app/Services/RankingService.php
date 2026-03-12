<?php

namespace App\Services;

use App\Models\Ranking;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class RankingService
{
    /**
     * Update or create ranking entry for a user.
     * Only updates if the new time is better (lower) than existing time.
     *
     * @param int $userId
     * @param int $completionTime Time in seconds
     * @return Ranking|null
     */
    public function updateRanking(int $userId, int $completionTime): ?Ranking
    {
        $existingRanking = Ranking::where('user_id', $userId)->first();

        // If user has no ranking, create new entry
        if (!$existingRanking) {
            $ranking = Ranking::create([
                'user_id' => $userId,
                'completion_time' => $completionTime,
                'rank' => 0, // Will be calculated later
            ]);

            $this->recalculateRanks();
            return $ranking->fresh();
        }

        // Only update if new time is better (lower)
        if ($completionTime < $existingRanking->completion_time) {
            $existingRanking->update([
                'completion_time' => $completionTime,
            ]);

            $this->recalculateRanks();
            return $existingRanking->fresh();
        }

        return null; // No update needed
    }

    /**
     * Recalculate ranks for all users based on completion time.
     * Rank 1 = fastest time, Rank 2 = second fastest, etc.
     *
     * @return void
     */
    public function recalculateRanks(): void
    {
        $rankings = Ranking::orderBy('completion_time', 'asc')->get();

        $rank = 1;
        foreach ($rankings as $ranking) {
            $ranking->update(['rank' => $rank]);
            $rank++;
        }

        // Clear rankings cache after recalculation
        cache()->forget('rankings_top_100');
    }

    /**
     * Get top N players from the ranking.
     *
     * @param int $limit
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getTopPlayers(int $limit = 100)
    {
        return Ranking::with('user:id,username')
            ->orderBy('rank', 'asc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get user's ranking entry with rank.
     *
     * @param int $userId
     * @return Ranking|null
     */
    public function getUserRank(int $userId): ?Ranking
    {
        return Ranking::with('user:id,username')
            ->where('user_id', $userId)
            ->first();
    }
}
