<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('puzzle_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('game_session_id')->constrained()->onDelete('cascade');
            $table->foreignId('puzzle_id')->constrained()->onDelete('cascade');
            $table->timestamp('started_at');
            $table->timestamp('completed_at')->nullable();
            $table->integer('time_spent')->default(0); // Seconds spent on this puzzle
            $table->integer('attempts')->default(0); // Number of submission attempts
            $table->integer('hints_used')->default(0); // Number of hints used
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
            
            // Unique constraint: one progress record per session per puzzle
            $table->unique(['game_session_id', 'puzzle_id'], 'unique_session_puzzle');
            
            // Index for queries
            $table->index('game_session_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('puzzle_progress');
    }
};
