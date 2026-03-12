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
        Schema::create('rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('completion_time'); // Time in seconds to complete the game
            $table->timestamp('completed_at');
            $table->timestamps();
            
            // Unique constraint: one ranking entry per user (best time only)
            $table->unique('user_id', 'unique_user_ranking');
            
            // Index for sorting by completion time
            $table->index('completion_time');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rankings');
    }
};
