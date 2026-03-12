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
        Schema::create('hints', function (Blueprint $table) {
            $table->id();
            $table->foreignId('puzzle_id')->constrained()->onDelete('cascade');
            $table->integer('level'); // 1, 2, or 3 (progressive hints)
            $table->text('content'); // The hint text
            $table->timestamps();
            
            // Unique constraint: one hint per puzzle per level
            $table->unique(['puzzle_id', 'level'], 'unique_puzzle_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hints');
    }
};
