<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameSessionController;
use App\Http\Controllers\PuzzleController;
use App\Http\Controllers\HintController;
use App\Http\Controllers\RankingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return response()->json([
        'message' => 'Bienvenido a la API de Escape Room Lovecraftiano',
        'version' => '1.0.0',
        'status' => 'en línea'
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Game Session Routes
    Route::prefix('game')->group(function () {
        Route::post('/start', [GameSessionController::class, 'start']);
        Route::get('/session', [GameSessionController::class, 'getSession']);
        Route::post('/sync', [GameSessionController::class, 'sync']);
        Route::post('/complete', [GameSessionController::class, 'complete']);
        Route::post('/abandon', [GameSessionController::class, 'abandon']);
    });
    
    // Puzzle Routes
    Route::prefix('puzzles')->group(function () {
        Route::get('/{sessionId}/current', [PuzzleController::class, 'getCurrentPuzzle']);
        Route::get('/{sessionId}/progress', [PuzzleController::class, 'getSessionProgress']);
        Route::post('/{puzzleId}/submit', [PuzzleController::class, 'submitSolution']);
        Route::get('/{puzzleId}/progress', [PuzzleController::class, 'getProgress']);
    });
    
    // Hint Routes
    Route::prefix('hints')->group(function () {
        Route::get('/puzzles/{puzzleId}/available', [HintController::class, 'checkAvailability']);
        Route::get('/puzzles/{puzzleId}/{level}', [HintController::class, 'getHint']);
    });
    
    // Ranking Routes
    Route::prefix('ranking')->group(function () {
        Route::get('/top', [RankingController::class, 'getTop']);
        Route::get('/user/{userId}', [RankingController::class, 'getUserRank']);
    });
});
