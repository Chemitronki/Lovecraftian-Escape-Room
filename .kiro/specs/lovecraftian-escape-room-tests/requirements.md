# Requirements Document: Lovecraftian Escape Room - Complete Test Suite

## Introduction

This document specifies the complete test suite requirements for the Lovecraftian Escape Room application. The application is a real-time multiplayer escape room game with a Laravel REST API backend, React/Redux frontend, and MySQL database. The test suite must ensure end-to-end functionality, security, data integrity, and proper integration between all components. A critical issue has been identified where users successfully log in but puzzles fail to load, requiring comprehensive testing to prevent similar issues.

## Glossary

- **System**: The Lovecraftian Escape Room application (backend API + frontend + database)
- **API**: Laravel REST API providing game endpoints
- **Frontend**: React application with Redux state management
- **Database**: MySQL database storing game data
- **User**: Authenticated player with valid Sanctum token
- **Session**: Active game instance for a user
- **Puzzle**: Individual challenge within a game session
- **Solution**: User's answer submission to a puzzle
- **Hint**: Clue provided to help solve a puzzle
- **Token**: Sanctum authentication token for API requests
- **Ranking**: Player's position in the leaderboard
- **CSRF**: Cross-Site Request Forgery protection
- **Constraint**: Database rule enforcing data validity
- **Round-Trip**: Process of encoding/decoding or serializing/deserializing data

## Requirements

### Requirement 1: Authentication Registration

**User Story:** As a new player, I want to register an account, so that I can access the game.

#### Acceptance Criteria

1. WHEN a valid registration request is submitted with email, password, and username, THE API SHALL create a new User record and return a Sanctum token
2. WHEN registration is attempted with an email that already exists, THE API SHALL return a 409 Conflict error with message "Email already registered"
3. WHEN registration is attempted with invalid email format, THE API SHALL return a 422 Unprocessable Entity error
4. WHEN registration is attempted with password shorter than 8 characters, THE API SHALL return a 422 Unprocessable Entity error
5. WHEN registration is attempted with missing required fields, THE API SHALL return a 422 Unprocessable Entity error listing all missing fields
6. THE Database SHALL store the password as a bcrypt hash, never in plain text
7. WHEN a user registers successfully, THE Frontend SHALL store the returned token in secure storage and set Redux auth state to authenticated

### Requirement 2: Authentication Login

**User Story:** As a registered player, I want to log in with my credentials, so that I can access my game sessions.

#### Acceptance Criteria

1. WHEN a valid login request is submitted with email and password, THE API SHALL verify credentials and return a valid Sanctum token
2. WHEN login is attempted with incorrect password, THE API SHALL return a 401 Unauthorized error
3. WHEN login is attempted with non-existent email, THE API SHALL return a 401 Unauthorized error
4. WHEN login is attempted with missing credentials, THE API SHALL return a 422 Unprocessable Entity error
5. WHEN a user logs in successfully, THE Frontend SHALL store the token and update Redux auth state
6. WHEN a user logs in successfully, THE Frontend SHALL clear any previous session data from Redux state

### Requirement 3: Authentication Logout

**User Story:** As a logged-in player, I want to log out, so that my session is terminated securely.

#### Acceptance Criteria

1. WHEN a logout request is submitted with a valid token, THE API SHALL revoke the Sanctum token
2. WHEN a logout request is submitted with an invalid token, THE API SHALL return a 401 Unauthorized error
3. WHEN a user logs out successfully, THE Frontend SHALL remove the token from storage
4. WHEN a user logs out successfully, THE Frontend SHALL clear all Redux state (auth, sessions, puzzles)
5. WHEN a user logs out, THE Frontend SHALL redirect to the login page

### Requirement 4: Protected Route Access

**User Story:** As the system, I want to protect game endpoints, so that only authenticated users can access them.

#### Acceptance Criteria

1. WHEN an API request is made without a token to a protected endpoint, THE API SHALL return a 401 Unauthorized error
2. WHEN an API request is made with an invalid token to a protected endpoint, THE API SHALL return a 401 Unauthorized error
3. WHEN an API request is made with an expired token to a protected endpoint, THE API SHALL return a 401 Unauthorized error
4. WHEN an API request is made with a valid token to a protected endpoint, THE API SHALL process the request normally
5. WHEN a Frontend component attempts to access a protected route without a token, THE Frontend SHALL redirect to login

### Requirement 5: User Data Isolation

**User Story:** As the system, I want to ensure users only access their own data, so that privacy is maintained.

#### Acceptance Criteria

1. WHEN User A requests their sessions, THE API SHALL return only sessions belonging to User A
2. WHEN User A attempts to access User B's session via direct ID, THE API SHALL return a 403 Forbidden error
3. WHEN User A attempts to access User B's puzzle progress, THE API SHALL return a 403 Forbidden error
4. WHEN User A attempts to update User B's ranking, THE API SHALL return a 403 Forbidden error
5. THE Database SHALL enforce foreign key constraints linking sessions to users

### Requirement 6: Game Session Creation

**User Story:** As a player, I want to start a new game session, so that I can begin playing the escape room.

#### Acceptance Criteria

1. WHEN a valid session start request is submitted with a game_id, THE API SHALL create a new Session record with status "active" and return session details
2. WHEN a session start request is submitted without a game_id, THE API SHALL return a 422 Unprocessable Entity error
3. WHEN a session is created, THE API SHALL initialize the first puzzle for that session
4. WHEN a session is created, THE Database SHALL set started_at to current timestamp
5. WHEN a session is created, THE API SHALL return session_id, current_puzzle_id, and remaining_time
6. WHEN a user creates a session, THE Frontend SHALL update Redux with the new session state
7. WHEN a user creates a session, THE Frontend SHALL display the first puzzle

### Requirement 7: Game Session Retrieval

**User Story:** As a player, I want to retrieve my active game sessions, so that I can resume playing.

#### Acceptance Criteria

1. WHEN a get sessions request is submitted with a valid token, THE API SHALL return all active sessions for that user
2. WHEN a get sessions request is submitted, THE API SHALL include session_id, game_id, status, started_at, and current_puzzle_id
3. WHEN a user has no active sessions, THE API SHALL return an empty array
4. WHEN a get sessions request is submitted, THE API SHALL order sessions by most recently started first
5. WHEN the Frontend retrieves sessions, THE Frontend SHALL populate Redux with session data
6. WHEN the Frontend retrieves sessions, THE Frontend SHALL display available sessions for the user to resume

### Requirement 8: Game Session Synchronization

**User Story:** As a player, I want to synchronize my session state with the server, so that my progress is always current.

#### Acceptance Criteria

1. WHEN a sync request is submitted with a valid session_id, THE API SHALL return current session state including current_puzzle_id, completed_puzzles, and remaining_time
2. WHEN a sync request is submitted with an invalid session_id, THE API SHALL return a 404 Not Found error
3. WHEN a sync request is submitted for a session belonging to another user, THE API SHALL return a 403 Forbidden error
4. WHEN a sync request is submitted, THE API SHALL verify the session is still active
5. WHEN a sync request is submitted for an abandoned session, THE API SHALL return status "abandoned"
6. WHEN the Frontend syncs a session, THE Frontend SHALL update Redux with the latest server state
7. WHEN the Frontend syncs a session, THE Frontend SHALL reconcile any local changes with server state

### Requirement 9: Game Session Completion

**User Story:** As a player, I want to complete a game session, so that my score is recorded.

#### Acceptance Criteria

1. WHEN a session completion request is submitted with a valid session_id and all puzzles solved, THE API SHALL set session status to "completed"
2. WHEN a session completion request is submitted with unsolved puzzles, THE API SHALL return a 422 Unprocessable Entity error
3. WHEN a session is completed, THE Database SHALL set completed_at to current timestamp
4. WHEN a session is completed, THE API SHALL calculate and store the final score based on time and hints used
5. WHEN a session is completed, THE API SHALL update the user's ranking
6. WHEN a session is completed, THE Frontend SHALL display completion screen with score and ranking
7. WHEN a session is completed, THE Frontend SHALL clear the active session from Redux

### Requirement 10: Game Session Abandonment

**User Story:** As a player, I want to abandon a game session, so that I can start a new one.

#### Acceptance Criteria

1. WHEN a session abandonment request is submitted with a valid session_id, THE API SHALL set session status to "abandoned"
2. WHEN a session is abandoned, THE Database SHALL set abandoned_at to current timestamp
3. WHEN a session is abandoned, THE API SHALL not update the user's ranking
4. WHEN a session is abandoned, THE Frontend SHALL remove the session from Redux
5. WHEN a session is abandoned, THE Frontend SHALL allow the user to start a new session

### Requirement 11: Get Current Puzzle

**User Story:** As a player, I want to retrieve the current puzzle, so that I can see the challenge to solve.

#### Acceptance Criteria

1. WHEN a get current puzzle request is submitted with a valid session_id, THE API SHALL return the puzzle details including puzzle_id, description, puzzle_type, and media_urls
2. WHEN a get current puzzle request is submitted with an invalid session_id, THE API SHALL return a 404 Not Found error
3. WHEN a get current puzzle request is submitted for a completed session, THE API SHALL return a 422 Unprocessable Entity error
4. WHEN a get current puzzle request is submitted for an abandoned session, THE API SHALL return a 422 Unprocessable Entity error
5. WHEN a puzzle is retrieved, THE API SHALL NOT return the solution or answer
6. WHEN the Frontend retrieves a puzzle, THE Frontend SHALL update Redux with puzzle data
7. WHEN the Frontend retrieves a puzzle, THE Frontend SHALL render the puzzle UI with description and media

### Requirement 12: Puzzle Solution Submission

**User Story:** As a player, I want to submit my solution to a puzzle, so that I can progress to the next puzzle.

#### Acceptance Criteria

1. WHEN a solution submission is made with a valid session_id, puzzle_id, and correct answer, THE API SHALL mark the puzzle as solved and return the next puzzle
2. WHEN a solution submission is made with an incorrect answer, THE API SHALL return a 422 Unprocessable Entity error with message "Incorrect solution"
3. WHEN a solution submission is made with missing answer field, THE API SHALL return a 422 Unprocessable Entity error
4. WHEN a solution submission is made for an already-solved puzzle, THE API SHALL return a 422 Unprocessable Entity error
5. WHEN a solution is submitted, THE Database SHALL record the submission timestamp and hint count used
6. WHEN a correct solution is submitted, THE API SHALL increment the completed_puzzles counter
7. WHEN a correct solution is submitted, THE Frontend SHALL update Redux with the new puzzle
8. WHEN a correct solution is submitted, THE Frontend SHALL display a success message and transition to the next puzzle

### Requirement 13: Puzzle Progress Tracking

**User Story:** As a player, I want to see my progress through the puzzles, so that I know how many remain.

#### Acceptance Criteria

1. WHEN a progress request is submitted with a valid session_id, THE API SHALL return completed_puzzle_count, total_puzzle_count, and current_puzzle_number
2. WHEN a progress request is submitted, THE API SHALL return the list of completed puzzle IDs
3. WHEN a progress request is submitted, THE API SHALL return remaining_time in seconds
4. WHEN the Frontend retrieves progress, THE Frontend SHALL update Redux with progress data
5. WHEN the Frontend displays progress, THE Frontend SHALL show a progress bar or counter

### Requirement 14: Hint Availability Check

**User Story:** As a player, I want to check if hints are available, so that I know if I can request help.

#### Acceptance Criteria

1. WHEN a hint availability check is submitted with a valid session_id and puzzle_id, THE API SHALL return hints_available (boolean) and hints_remaining (integer)
2. WHEN a hint availability check is submitted, THE API SHALL verify the user has not exceeded the maximum hints per puzzle (3)
3. WHEN a hint availability check is submitted, THE API SHALL verify the user has not exceeded the maximum hints per session (10)
4. WHEN hints are available, THE API SHALL return hints_available as true
5. WHEN hints are not available, THE API SHALL return hints_available as false with reason
6. WHEN the Frontend checks hint availability, THE Frontend SHALL enable or disable the hint button accordingly

### Requirement 15: Hint Retrieval

**User Story:** As a player, I want to get a hint for the current puzzle, so that I can get help solving it.

#### Acceptance Criteria

1. WHEN a hint request is submitted with a valid session_id and puzzle_id, THE API SHALL return a hint text and increment the hints_used counter
2. WHEN a hint request is submitted but hints are exhausted, THE API SHALL return a 422 Unprocessable Entity error
3. WHEN a hint request is submitted for an already-solved puzzle, THE API SHALL return a 422 Unprocessable Entity error
4. WHEN a hint is retrieved, THE Database SHALL record the hint_id and timestamp
5. WHEN a hint is retrieved, THE API SHALL not return the solution
6. WHEN the Frontend retrieves a hint, THE Frontend SHALL display it to the user
7. WHEN the Frontend retrieves a hint, THE Frontend SHALL update the hints_remaining counter

### Requirement 16: Top Rankings Retrieval

**User Story:** As a player, I want to see the top players, so that I can compare my performance.

#### Acceptance Criteria

1. WHEN a top rankings request is submitted, THE API SHALL return the top 100 players ordered by score descending
2. WHEN a top rankings request is submitted, THE API SHALL include rank, username, score, completion_time, and games_completed
3. WHEN a top rankings request is submitted, THE API SHALL only include completed sessions
4. WHEN a top rankings request is submitted, THE API SHALL calculate scores based on time and hints used
5. WHEN the Frontend retrieves rankings, THE Frontend SHALL display them in a leaderboard format
6. WHEN the Frontend displays rankings, THE Frontend SHALL highlight the current user's rank if applicable

### Requirement 17: User Rank Retrieval

**User Story:** As a player, I want to see my personal ranking, so that I know my position on the leaderboard.

#### Acceptance Criteria

1. WHEN a user rank request is submitted with a valid token, THE API SHALL return the user's current rank, score, and percentile
2. WHEN a user rank request is submitted, THE API SHALL calculate rank based on completed sessions only
3. WHEN a user has no completed sessions, THE API SHALL return rank as null or "unranked"
4. WHEN a user rank request is submitted, THE API SHALL include games_completed and average_completion_time
5. WHEN the Frontend retrieves user rank, THE Frontend SHALL display it prominently
6. WHEN the Frontend displays user rank, THE Frontend SHALL show comparison metrics (percentile, average time)

### Requirement 18: CSRF Protection

**User Story:** As the system, I want to protect against CSRF attacks, so that malicious requests are prevented.

#### Acceptance Criteria

1. WHEN a state-changing request (POST, PUT, DELETE) is submitted without a CSRF token, THE API SHALL return a 419 Token Mismatch error
2. WHEN a state-changing request is submitted with an invalid CSRF token, THE API SHALL return a 419 Token Mismatch error
3. WHEN a state-changing request is submitted with a valid CSRF token, THE API SHALL process the request normally
4. WHEN the Frontend loads, THE Frontend SHALL retrieve and store the CSRF token
5. WHEN the Frontend makes state-changing requests, THE Frontend SHALL include the CSRF token in headers

### Requirement 19: Input Validation

**User Story:** As the system, I want to validate all user inputs, so that invalid data is rejected.

#### Acceptance Criteria

1. WHEN an API request is submitted with SQL injection attempts in string fields, THE API SHALL sanitize and reject the input
2. WHEN an API request is submitted with XSS attempts in string fields, THE API SHALL sanitize and reject the input
3. WHEN an API request is submitted with oversized payloads, THE API SHALL return a 413 Payload Too Large error
4. WHEN an API request is submitted with invalid data types, THE API SHALL return a 422 Unprocessable Entity error
5. WHEN an API request is submitted with out-of-range numeric values, THE API SHALL return a 422 Unprocessable Entity error
6. THE Frontend SHALL validate inputs before submission and display user-friendly error messages

### Requirement 20: Database Integrity - Foreign Keys

**User Story:** As the system, I want to maintain referential integrity, so that data consistency is guaranteed.

#### Acceptance Criteria

1. WHEN a session is created, THE Database SHALL enforce that the user_id references an existing User record
2. WHEN a session is created, THE Database SHALL enforce that the game_id references an existing Game record
3. WHEN a puzzle is assigned to a session, THE Database SHALL enforce that the puzzle_id references an existing Puzzle record
4. WHEN a hint is created, THE Database SHALL enforce that the puzzle_id references an existing Puzzle record
5. WHEN a session is deleted, THE Database SHALL cascade delete all related puzzles and hints
6. WHEN an attempt is made to delete a user with active sessions, THE Database SHALL prevent deletion or cascade appropriately

### Requirement 21: Database Integrity - Constraints

**User Story:** As the system, I want to enforce data constraints, so that invalid states are prevented.

#### Acceptance Criteria

1. WHEN a session is created, THE Database SHALL enforce that started_at is not null
2. WHEN a session is completed, THE Database SHALL enforce that completed_at is after started_at
3. WHEN a session is abandoned, THE Database SHALL enforce that abandoned_at is after started_at
4. WHEN a puzzle solution is recorded, THE Database SHALL enforce that solved_at is after the session started_at
5. WHEN a hint is used, THE Database SHALL enforce that hints_used does not exceed 3 per puzzle
6. WHEN a session is created, THE Database SHALL enforce that remaining_time is positive

### Requirement 22: Token Expiration Handling

**User Story:** As the system, I want to handle expired tokens gracefully, so that users are prompted to re-authenticate.

#### Acceptance Criteria

1. WHEN an API request is made with an expired token, THE API SHALL return a 401 Unauthorized error
2. WHEN the Frontend receives a 401 error, THE Frontend SHALL clear the token from storage
3. WHEN the Frontend receives a 401 error, THE Frontend SHALL redirect to the login page
4. WHEN the Frontend receives a 401 error, THE Frontend SHALL display a message "Session expired, please log in again"
5. WHEN a user logs in again, THE Frontend SHALL retrieve a new token and resume normal operation

### Requirement 23: API Response Format Consistency

**User Story:** As the Frontend, I want consistent API response formats, so that data handling is predictable.

#### Acceptance Criteria

1. WHEN the API returns a successful response, THE API SHALL use HTTP 200 for GET requests and 201 for POST requests
2. WHEN the API returns a successful response, THE API SHALL include a "data" field containing the response payload
3. WHEN the API returns an error response, THE API SHALL include an "error" field with error message and "code" field with error code
4. WHEN the API returns a paginated response, THE API SHALL include "data", "pagination" with "page", "per_page", "total", and "last_page"
5. WHEN the API returns validation errors, THE API SHALL include a "errors" field with field-level error messages
6. WHEN the Frontend receives an API response, THE Frontend SHALL parse it according to the consistent format

### Requirement 24: Redux State Management

**User Story:** As the Frontend, I want proper Redux state management, so that component state is consistent.

#### Acceptance Criteria

1. WHEN a user logs in, THE Redux auth reducer SHALL set user data, token, and authenticated flag
2. WHEN a user logs out, THE Redux auth reducer SHALL clear all auth state
3. WHEN a session is created, THE Redux sessions reducer SHALL add the new session to the state
4. WHEN a session is updated, THE Redux sessions reducer SHALL merge the updated data with existing session
5. WHEN a puzzle is retrieved, THE Redux puzzles reducer SHALL set the current puzzle data
6. WHEN a solution is submitted, THE Redux puzzles reducer SHALL update the progress and current puzzle
7. WHEN an error occurs, THE Redux error reducer SHALL store the error message and code
8. WHEN the user navigates away, THE Redux state SHALL persist across page reloads (via localStorage)

### Requirement 25: End-to-End Login to Puzzle Flow

**User Story:** As a player, I want to complete the full flow from login to solving a puzzle, so that the game is playable.

#### Acceptance Criteria

1. WHEN a user logs in with valid credentials, THE Frontend SHALL receive a token and update Redux auth state
2. WHEN a user is authenticated, THE Frontend SHALL retrieve their active sessions
3. WHEN a user creates a new session, THE API SHALL initialize the first puzzle
4. WHEN a user views the current puzzle, THE Frontend SHALL display the puzzle description and media
5. WHEN a user submits a correct solution, THE API SHALL mark the puzzle as solved and return the next puzzle
6. WHEN a user submits an incorrect solution, THE Frontend SHALL display an error message and allow retry
7. WHEN a user completes all puzzles, THE API SHALL mark the session as completed and calculate the score
8. WHEN a session is completed, THE Frontend SHALL display the completion screen with score and ranking

### Requirement 26: Error Handling and Recovery

**User Story:** As the system, I want to handle errors gracefully, so that users understand what went wrong.

#### Acceptance Criteria

1. WHEN a network error occurs, THE Frontend SHALL display a user-friendly error message
2. WHEN a network error occurs, THE Frontend SHALL provide an option to retry the request
3. WHEN an API error occurs, THE Frontend SHALL log the error details for debugging
4. WHEN a database error occurs, THE API SHALL return a 500 Internal Server Error with a generic message
5. WHEN a database error occurs, THE API SHALL log the detailed error for administrators
6. WHEN a timeout occurs, THE Frontend SHALL display a timeout message and allow retry
7. WHEN a session expires during gameplay, THE Frontend SHALL save the session state and prompt re-login

### Requirement 27: Performance - API Response Time

**User Story:** As a player, I want fast API responses, so that the game feels responsive.

#### Acceptance Criteria

1. WHEN a get current puzzle request is submitted, THE API SHALL respond within 200ms
2. WHEN a solution submission is made, THE API SHALL respond within 300ms
3. WHEN a hint request is submitted, THE API SHALL respond within 200ms
4. WHEN a rankings request is submitted, THE API SHALL respond within 500ms
5. WHEN a session sync request is submitted, THE API SHALL respond within 200ms

### Requirement 28: Performance - Database Query Optimization

**User Story:** As the system, I want optimized database queries, so that performance scales with users.

#### Acceptance Criteria

1. WHEN retrieving a user's sessions, THE Database query SHALL use indexed lookups on user_id
2. WHEN retrieving rankings, THE Database query SHALL use indexed lookups on score and completion_time
3. WHEN retrieving puzzle progress, THE Database query SHALL use indexed lookups on session_id
4. WHEN retrieving hints, THE Database query SHALL use indexed lookups on puzzle_id and session_id
5. THE Database indexes SHALL be created on all foreign key columns

### Requirement 29: Puzzle Loading Issue Detection

**User Story:** As the system, I want to detect and prevent puzzle loading failures, so that the reported issue is resolved.

#### Acceptance Criteria

1. WHEN a session is created, THE API SHALL verify that the first puzzle is successfully initialized
2. WHEN a puzzle is retrieved, THE API SHALL verify that puzzle data is complete (description, type, media_urls)
3. WHEN a puzzle is retrieved, THE API SHALL verify that the puzzle_id matches the session's current_puzzle_id
4. WHEN a puzzle is retrieved, THE API SHALL verify that the puzzle has not been deleted or archived
5. WHEN a puzzle fails to load, THE API SHALL return a 500 error with detailed logging
6. WHEN the Frontend receives a puzzle, THE Frontend SHALL validate that all required fields are present
7. WHEN the Frontend receives a puzzle, THE Frontend SHALL verify that media_urls are valid URLs
8. WHEN a puzzle fails to load on the Frontend, THE Frontend SHALL display an error message and provide a retry option

### Requirement 30: Round-Trip Data Validation

**User Story:** As the system, I want to ensure data integrity through round-trip validation, so that serialization/deserialization is correct.

#### Acceptance Criteria

1. WHEN a session object is serialized to JSON and deserialized, THE resulting object SHALL be equivalent to the original
2. WHEN a puzzle object is serialized to JSON and deserialized, THE resulting object SHALL be equivalent to the original
3. WHEN a user object is serialized to JSON and deserialized, THE resulting object SHALL be equivalent to the original
4. WHEN a ranking object is serialized to JSON and deserialized, THE resulting object SHALL be equivalent to the original
5. WHEN Redux state is serialized to localStorage and deserialized, THE resulting state SHALL be equivalent to the original

