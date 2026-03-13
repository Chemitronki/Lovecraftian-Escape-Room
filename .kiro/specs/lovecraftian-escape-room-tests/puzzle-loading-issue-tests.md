# Puzzle Loading Issue - Comprehensive Test Suite

## Problem Statement

Users successfully authenticate but puzzles fail to load after login. This document provides comprehensive tests to detect, prevent, and debug this specific issue.

## Root Cause Analysis Tests

### Test 1: Session Creation Puzzle Initialization

**Purpose**: Verify that when a session is created, the first puzzle is properly initialized.

```php
// tests/Backend/Feature/Sessions/PuzzleInitializationTest.php
namespace Tests\Feature\Sessions;

use Tests\TestCase;
use App\Models\User;
use App\Models\Game;
use App\Models\Session;
use App\Models\Puzzle;

class PuzzleInitializationTest extends TestCase
{
    /**
     * Test that session creation initializes first puzzle
     * Requirement 6: Game Session Creation
     * Requirement 29: Puzzle Loading Issue Detection
     */
    public function test_session_creation_initializes_first_puzzle(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/sessions', ['game_id' => $game->id]);

        $response->assertStatus(201);
        
        $sessionId = $response->json('data.session_id');
        $puzzleId = $response->json('data.current_puzzle_id');

        // Verify session exists
        $session = Session::find($sessionId);
        $this->assertNotNull($session, 'Session was not created');
        $this->assertEquals('active', $session->status);
        $this->assertNotNull($session->started_at);

        // Verify puzzle exists
        $this->assertNotNull($puzzleId, 'Puzzle ID is null');
        $puzzle = Puzzle::find($puzzleId);
        $this->assertNotNull($puzzle, 'Puzzle was not created');
        
        // Verify puzzle belongs to session
        $this->assertEquals($sessionId, $puzzle->session_id);
    }

    /**
     * Test that puzzle has all required fields
     */
    public function test_puzzle_has_all_required_fields(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/sessions', ['game_id' => $game->id]);

        $puzzleId = $response->json('data.current_puzzle_id');
        $puzzle = Puzzle::find($puzzleId);

        // Verify all required fields
        $this->assertNotNull($puzzle->description, 'Puzzle description is null');
        $this->assertNotNull($puzzle->puzzle_type, 'Puzzle type is null');
        $this->assertNotNull($puzzle->media_urls, 'Media URLs are null');
        $this->assertIsArray($puzzle->media_urls, 'Media URLs is not an array');
        $this->assertNotEmpty($puzzle->media_urls, 'Media URLs array is empty');
    }

    /**
     * Test that puzzle data is not corrupted
     */
    public function test_puzzle_data_is_not_corrupted(): void
    {
        $user = User::factory()->create();
        $game = Game::factory()->create();

        $response = $this->actingAs($user)
            ->postJson('/api/sessions', ['game_id' => $game->id]);

        $puzzleId = $response->json('data.current_puzzle_id');
        $puzzle = Puzzle::find($puzzleId);

        // Verify data types
        $this->assertIsString($puzzle->description);
        $this->assertIsString($puzzle->puzzle_type);
        $this->assertIsArray($puzzle->media_urls);
        
        // Verify media URLs are valid
        foreach ($puzzle->media_urls as $url) {
            $this->assertIsString($url);
            $this->assertTrue(
                filter_var($url, FILTER_VALIDATE_URL),
                "Invalid URL: {$url}"
            );
        }
    }
}
```

### Test 2: API Response Validation

**Purpose**: Verify that the API returns complete puzzle data in the correct format.

```php
// tests/Backend/Feature/Puzzles/PuzzleResponseValidationTest.php
namespace Tests\Feature\Puzzles;

use Tests\TestCase;
use App\Models\User;
use App\Models\Session;
use App\Models\Puzzle;

class PuzzleResponseValidationTest extends TestCase
{
    /**
     * Test that get puzzle endpoint returns complete data
     */
    public function test_get_puzzle_returns_complete_response(): void
    {
        $user = User::factory()->create();
        $session = Session::factory()->for($user)->create();
        $puzzle = Puzzle::factory()->for($session)->create();
        $session->update(['current_puzzle_id' => $puzzle->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/puzzle");

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                'puzzle_id',
                'description',
                'puzzle_type',
                'media_urls',
            ],
            'code',
        ]);

        $data = $response->json('data');
        
        // Verify no null values
        $this->assertNotNull($data['puzzle_id']);
        $this->assertNotNull($data['description']);
        $this->assertNotNull($data['puzzle_type']);
        $this->assertNotNull($data['media_urls']);
        
        // Verify solution is not exposed
        $this->assertArrayNotHasKey('solution', $data);
        $this->assertArrayNotHasKey('answer', $data);
    }

    /**
     * Test that puzzle response is JSON serializable
     */
    public function test_puzzle_response_is_json_serializable(): void
    {
        $user = User::factory()->create();
        $session = Session::factory()->for($user)->create();
        $puzzle = Puzzle::factory()->for($session)->create();
        $session->update(['current_puzzle_id' => $puzzle->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/puzzle");

        // Verify response can be decoded
        $decoded = json_decode($response->getContent(), true);
        $this->assertIsArray($decoded);
        $this->assertArrayHasKey('data', $decoded);
    }

    /**
     * Test that media URLs are properly formatted
     */
    public function test_media_urls_are_properly_formatted(): void
    {
        $user = User::factory()->create();
        $session = Session::factory()->for($user)->create();
        $puzzle = Puzzle::factory()->for($session)->create();
        $session->update(['current_puzzle_id' => $puzzle->id]);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/puzzle");

        $mediaUrls = $response->json('data.media_urls');
        
        $this->assertIsArray($mediaUrls);
        foreach ($mediaUrls as $url) {
            $this->assertIsString($url);
            $this->assertTrue(
                filter_var($url, FILTER_VALIDATE_URL),
                "Invalid URL format: {$url}"
            );
        }
    }
}
```

### Test 3: Frontend Puzzle Reception and Rendering

**Purpose**: Verify that the frontend correctly receives and renders puzzle data.

```typescript
// tests/Frontend/Integration/Flows/puzzleLoadingFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PuzzleDisplay from '@/components/PuzzleDisplay';
import puzzleReducer from '@/store/puzzleSlice';
import { vi } from 'vitest';

/**
 * Test complete puzzle loading flow
 * Requirement 29: Puzzle Loading Issue Detection
 */
describe('Puzzle Loading Flow', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        puzzle: puzzleReducer,
      },
    });
  });

  /**
   * Test that puzzle data is received and stored in Redux
   */
  it('should receive puzzle data and store in Redux', async () => {
    const mockPuzzleData = {
      puzzle_id: 1,
      description: 'Solve this riddle',
      puzzle_type: 'riddle',
      media_urls: ['https://example.com/image.jpg'],
    };

    // Mock API response
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: mockPuzzleData }),
    });

    render(
      <Provider store={store}>
        <PuzzleDisplay puzzle={mockPuzzleData} />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Solve this riddle')).toBeInTheDocument();
    });
  });

  /**
   * Test that puzzle renders with all required elements
   */
  it('should render puzzle with all required elements', () => {
    const mockPuzzleData = {
      puzzle_id: 1,
      description: 'Solve this riddle',
      puzzle_type: 'riddle',
      media_urls: ['https://example.com/image.jpg'],
    };

    render(
      <Provider store={store}>
        <PuzzleDisplay puzzle={mockPuzzleData} />
      </Provider>
    );

    // Verify all elements are rendered
    expect(screen.getByText('Solve this riddle')).toBeInTheDocument();
    expect(screen.getByAltText(/puzzle/i)).toBeInTheDocument();
  });

  /**
   * Test that puzzle handles missing data gracefully
   */
  it('should handle missing puzzle data gracefully', () => {
    const incompletePuzzle = {
      puzzle_id: 1,
      description: 'Test',
      // Missing puzzle_type and media_urls
    };

    render(
      <Provider store={store}>
        <PuzzleDisplay puzzle={incompletePuzzle} />
      </Provider>
    );

    // Should show error message
    expect(screen.getByText(/puzzle data incomplete/i)).toBeInTheDocument();
  });

  /**
   * Test that puzzle validates media URLs before rendering
   */
  it('should validate media URLs before rendering', () => {
    const puzzleWithInvalidUrl = {
      puzzle_id: 1,
      description: 'Test',
      puzzle_type: 'riddle',
      media_urls: ['not-a-valid-url'],
    };

    render(
      <Provider store={store}>
        <PuzzleDisplay puzzle={puzzleWithInvalidUrl} />
      </Provider>
    );

    // Should show error for invalid URL
    expect(screen.getByText(/invalid media url/i)).toBeInTheDocument();
  });
});
```

## End-to-End Flow Tests

### Test 4: Complete Login to Puzzle Display

**Purpose**: Test the entire flow from login to puzzle display to catch any breaking points.

```typescript
// tests/Integration/CompleteLoginPuzzleFlow.test.ts
import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

/**
 * Complete end-to-end test for login to puzzle display
 * Requirement 25: End-to-End Login to Puzzle Flow
 * Requirement 29: Puzzle Loading Issue Detection
 */
describe('Complete Login to Puzzle Display Flow', () => {
  const API_URL = 'http://localhost:8000/api';
  const FRONTEND_URL = 'http://localhost:3000';
  
  let token: string;
  let sessionId: number;
  let userId: number;

  /**
   * Step 1: User Registration
   */
  it('Step 1: User should register successfully', async () => {
    const email = `test-${Date.now()}@example.com`;
    
    const response = await axios.post(`${API_URL}/register`, {
      email,
      password: 'password123',
      username: `testuser${Date.now()}`,
    });

    expect(response.status).toBe(201);
    expect(response.data.data.token).toBeDefined();
    expect(response.data.data.user.id).toBeDefined();

    token = response.data.data.token;
    userId = response.data.data.user.id;
  });

  /**
   * Step 2: User Login
   */
  it('Step 2: User should login successfully', async () => {
    const response = await axios.post(`${API_URL}/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.data.data.token).toBeDefined();
    
    token = response.data.data.token;
  });

  /**
   * Step 3: Create Session
   */
  it('Step 3: Session should be created with first puzzle', async () => {
    const response = await axios.post(
      `${API_URL}/sessions`,
      { game_id: 1 },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(response.status).toBe(201);
    expect(response.data.data.session_id).toBeDefined();
    expect(response.data.data.current_puzzle_id).toBeDefined();
    expect(response.data.data.status).toBe('active');

    sessionId = response.data.data.session_id;
  });

  /**
   * Step 4: Retrieve Current Puzzle
   */
  it('Step 4: Current puzzle should be retrieved with complete data', async () => {
    const response = await axios.get(
      `${API_URL}/sessions/${sessionId}/puzzle`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    expect(response.status).toBe(200);
    
    const puzzle = response.data.data;
    
    // Verify all required fields
    expect(puzzle.puzzle_id).toBeDefined();
    expect(puzzle.description).toBeDefined();
    expect(puzzle.puzzle_type).toBeDefined();
    expect(puzzle.media_urls).toBeDefined();
    
    // Verify data types
    expect(typeof puzzle.puzzle_id).toBe('number');
    expect(typeof puzzle.description).toBe('string');
    expect(typeof puzzle.puzzle_type).toBe('string');
    expect(Array.isArray(puzzle.media_urls)).toBe(true);
    
    // Verify media URLs are valid
    expect(puzzle.media_urls.length).toBeGreaterThan(0);
    puzzle.media_urls.forEach((url: string) => {
      expect(typeof url).toBe('string');
      expect(url).toMatch(/^https?:\/\//);
    });
    
    // Verify solution is not exposed
    expect(puzzle.solution).toBeUndefined();
    expect(puzzle.answer).toBeUndefined();
  });

  /**
   * Step 5: Verify Data Integrity
   */
  it('Step 5: Data should maintain integrity through serialization', async () => {
    const response = await axios.get(
      `${API_URL}/sessions/${sessionId}/puzzle`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const originalData = response.data.data;
    
    // Serialize and deserialize
    const serialized = JSON.stringify(originalData);
    const deserialized = JSON.parse(serialized);

    // Verify equivalence
    expect(deserialized.puzzle_id).toBe(originalData.puzzle_id);
    expect(deserialized.description).toBe(originalData.description);
    expect(deserialized.puzzle_type).toBe(originalData.puzzle_type);
    expect(deserialized.media_urls).toEqual(originalData.media_urls);
  });
});
```

## Debugging Tests

### Test 5: Detailed Logging for Issue Detection

**Purpose**: Provide detailed logging to help identify where the puzzle loading fails.

```php
// tests/Backend/Feature/Sessions/PuzzleLoadingDebugTest.php
namespace Tests\Feature\Sessions;

use Tests\TestCase;
use App\Models\User;
use App\Models\Game;
use App\Models\Session;
use App\Models\Puzzle;
use Illuminate\Support\Facades\Log;

class PuzzleLoadingDebugTest extends TestCase
{
    /**
     * Test with detailed logging for debugging
     */
    public function test_puzzle_loading_with_detailed_logging(): void
    {
        Log::info('=== PUZZLE LOADING DEBUG TEST START ===');
        
        $user = User::factory()->create();
        Log::info("User created: {$user->id}");
        
        $game = Game::factory()->create();
        Log::info("Game created: {$game->id}");

        Log::info('Creating session...');
        $response = $this->actingAs($user)
            ->postJson('/api/sessions', ['game_id' => $game->id]);

        Log::info("Session creation response status: {$response->status()}");
        Log::info("Session creation response: " . json_encode($response->json()));

        $this->assertEquals(201, $response->status());
        
        $sessionId = $response->json('data.session_id');
        $puzzleId = $response->json('data.current_puzzle_id');
        
        Log::info("Session ID: {$sessionId}");
        Log::info("Puzzle ID: {$puzzleId}");

        // Verify session
        $session = Session::find($sessionId);
        Log::info("Session found: " . ($session ? 'YES' : 'NO'));
        if ($session) {
            Log::info("Session status: {$session->status}");
            Log::info("Session current_puzzle_id: {$session->current_puzzle_id}");
        }

        // Verify puzzle
        $puzzle = Puzzle::find($puzzleId);
        Log::info("Puzzle found: " . ($puzzle ? 'YES' : 'NO'));
        if ($puzzle) {
            Log::info("Puzzle description: {$puzzle->description}");
            Log::info("Puzzle type: {$puzzle->puzzle_type}");
            Log::info("Puzzle media_urls: " . json_encode($puzzle->media_urls));
        }

        Log::info('=== PUZZLE LOADING DEBUG TEST END ===');

        $this->assertNotNull($session);
        $this->assertNotNull($puzzle);
    }

    /**
     * Test puzzle retrieval with detailed logging
     */
    public function test_puzzle_retrieval_with_detailed_logging(): void
    {
        Log::info('=== PUZZLE RETRIEVAL DEBUG TEST START ===');
        
        $user = User::factory()->create();
        $session = Session::factory()->for($user)->create();
        $puzzle = Puzzle::factory()->for($session)->create();
        $session->update(['current_puzzle_id' => $puzzle->id]);

        Log::info("User ID: {$user->id}");
        Log::info("Session ID: {$session->id}");
        Log::info("Puzzle ID: {$puzzle->id}");

        Log::info('Retrieving puzzle...');
        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/puzzle");

        Log::info("Puzzle retrieval response status: {$response->status()}");
        Log::info("Puzzle retrieval response: " . json_encode($response->json()));

        $this->assertEquals(200, $response->status());

        $data = $response->json('data');
        Log::info("Response data: " . json_encode($data));

        Log::info('=== PUZZLE RETRIEVAL DEBUG TEST END ===');

        $this->assertNotNull($data['puzzle_id']);
        $this->assertNotNull($data['description']);
    }
}
```

## Monitoring and Alerts

### Test 6: Performance Monitoring

**Purpose**: Monitor puzzle loading performance to detect degradation.

```php
// tests/Performance/PuzzleLoadingPerformanceTest.php
namespace Tests\Performance;

use Tests\TestCase;
use App\Models\User;
use App\Models\Session;
use App\Models\Puzzle;

class PuzzleLoadingPerformanceTest extends TestCase
{
    /**
     * Test puzzle loading performance
     */
    public function test_puzzle_loading_performance(): void
    {
        $user = User::factory()->create();
        $session = Session::factory()->for($user)->create();
        $puzzle = Puzzle::factory()->for($session)->create();
        $session->update(['current_puzzle_id' => $puzzle->id]);

        $startTime = microtime(true);

        $response = $this->actingAs($user)
            ->getJson("/api/sessions/{$session->id}/puzzle");

        $endTime = microtime(true);
        $duration = ($endTime - $startTime) * 1000; // Convert to ms

        $response->assertStatus(200);

        // Alert if performance degrades
        if ($duration > 200) {
            \Log::warning("Puzzle loading slow: {$duration}ms");
        }

        $this->assertLessThan(200, $duration, "Puzzle loading took {$duration}ms");
    }

    /**
     * Test session creation performance
     */
    public function test_session_creation_performance(): void
    {
        $user = User::factory()->create();
        $game = \App\Models\Game::factory()->create();

        $startTime = microtime(true);

        $response = $this->actingAs($user)
            ->postJson('/api/sessions', ['game_id' => $game->id]);

        $endTime = microtime(true);
        $duration = ($endTime - $startTime) * 1000;

        $response->assertStatus(201);

        if ($duration > 300) {
            \Log::warning("Session creation slow: {$duration}ms");
        }

        $this->assertLessThan(300, $duration, "Session creation took {$duration}ms");
    }
}
```

## Continuous Monitoring Script

### Automated Puzzle Loading Health Check

```bash
#!/bin/bash
# scripts/check-puzzle-loading.sh

API_URL="http://localhost:8000/api"
ALERT_EMAIL="admin@example.com"

# Register user
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"test-$(date +%s)@example.com\",
    \"password\": \"password123\",
    \"username\": \"testuser$(date +%s)\"
  }")

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo "ALERT: Failed to register user"
  echo $REGISTER_RESPONSE | mail -s "Puzzle Loading Issue: Registration Failed" $ALERT_EMAIL
  exit 1
fi

# Create session
SESSION_RESPONSE=$(curl -s -X POST "$API_URL/sessions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"game_id": 1}')

SESSION_ID=$(echo $SESSION_RESPONSE | jq -r '.data.session_id')
PUZZLE_ID=$(echo $SESSION_RESPONSE | jq -r '.data.current_puzzle_id')

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" == "null" ]; then
  echo "ALERT: Failed to create session"
  echo $SESSION_RESPONSE | mail -s "Puzzle Loading Issue: Session Creation Failed" $ALERT_EMAIL
  exit 1
fi

if [ -z "$PUZZLE_ID" ] || [ "$PUZZLE_ID" == "null" ]; then
  echo "ALERT: Puzzle ID is null after session creation"
  echo $SESSION_RESPONSE | mail -s "Puzzle Loading Issue: Puzzle Not Initialized" $ALERT_EMAIL
  exit 1
fi

# Retrieve puzzle
PUZZLE_RESPONSE=$(curl -s -X GET "$API_URL/sessions/$SESSION_ID/puzzle" \
  -H "Authorization: Bearer $TOKEN")

PUZZLE_DATA=$(echo $PUZZLE_RESPONSE | jq '.data')

if [ -z "$PUZZLE_DATA" ] || [ "$PUZZLE_DATA" == "null" ]; then
  echo "ALERT: Failed to retrieve puzzle"
  echo $PUZZLE_RESPONSE | mail -s "Puzzle Loading Issue: Puzzle Retrieval Failed" $ALERT_EMAIL
  exit 1
fi

# Verify puzzle has required fields
DESCRIPTION=$(echo $PUZZLE_DATA | jq -r '.description')
MEDIA_URLS=$(echo $PUZZLE_DATA | jq '.media_urls')

if [ -z "$DESCRIPTION" ] || [ "$DESCRIPTION" == "null" ]; then
  echo "ALERT: Puzzle description is missing"
  echo $PUZZLE_RESPONSE | mail -s "Puzzle Loading Issue: Missing Description" $ALERT_EMAIL
  exit 1
fi

if [ -z "$MEDIA_URLS" ] || [ "$MEDIA_URLS" == "null" ]; then
  echo "ALERT: Puzzle media URLs are missing"
  echo $PUZZLE_RESPONSE | mail -s "Puzzle Loading Issue: Missing Media URLs" $ALERT_EMAIL
  exit 1
fi

echo "SUCCESS: Puzzle loading flow is working correctly"
exit 0
```

