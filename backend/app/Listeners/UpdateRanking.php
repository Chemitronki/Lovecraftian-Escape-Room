<?php

namespace App\Listeners;

use App\Events\GameCompleted;
use App\Models\Ranking;

class UpdateRanking
{
    public function handle(GameCompleted $event)
    {
        $gameSession = $event->gameSession;
        
        \Log::info('UpdateRanking listener triggered', [
            'user_id' => $gameSession->user_id,
            'status' => $gameSession->status,
            'completion_time' => $gameSession->completion_time
        ]);
        
        if ($gameSession->status !== 'completed' || !$gameSession->completion_time) {
            \Log::warning('UpdateRanking: Session not completed or no completion time', [
                'status' => $gameSession->status,
                'completion_time' => $gameSession->completion_time
            ]);
            return;
        }
        
        $existingRanking = Ranking::where('user_id', $gameSession->user_id)->first();
        
        if ($existingRanking) {
            // Only update if new time is better
            if ($gameSession->completion_time < $existingRanking->completion_time) {
                $existingRanking->update([
                    'completion_time' => $gameSession->completion_time,
                    'completed_at' => $gameSession->completed_at,
                ]);
                \Log::info('UpdateRanking: Updated existing ranking', [
                    'user_id' => $gameSession->user_id,
                    'new_time' => $gameSession->completion_time
                ]);
            }
        } else {
            // Create new ranking entry
            Ranking::create([
                'user_id' => $gameSession->user_id,
                'completion_time' => $gameSession->completion_time,
                'completed_at' => $gameSession->completed_at,
            ]);
            \Log::info('UpdateRanking: Created new ranking', [
                'user_id' => $gameSession->user_id,
                'completion_time' => $gameSession->completion_time
            ]);
        }
    }
}
