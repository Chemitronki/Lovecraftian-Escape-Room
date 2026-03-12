# Implementation Plan: Lovecraftian Escape Room

## Overview

Este plan de implementación desglosa el desarrollo de la aplicación web de escape room lovecraftiano en tareas incrementales y ejecutables. El proyecto se construirá en capas, comenzando con la infraestructura base (backend Laravel + frontend Vue/React), seguido por los módulos core (autenticación, sesiones de juego), luego los puzzles y sistemas de soporte (pistas, ranking), y finalmente la integración multimedia y pulido.

Cada tarea incluye referencias específicas a los requisitos que implementa. Las sub-tareas marcadas con `*` son opcionales (principalmente tests) y pueden omitirse para un MVP más rápido.

## Tasks

- [x] 1. Setup project infrastructure and base configuration
  - [x] 1.1 Initialize Laravel backend project
    - Create Laravel 10.x project with Composer
    - Configure database connection (MySQL/PostgreSQL)
    - Set up environment variables (.env)
    - Install Laravel Sanctum for API authentication
    - Configure CORS policies for SPA
    - _Requirements: 8.1, 8.8, 10.5_

  - [x] 1.2 Initialize frontend project (Vue.js or React)
    - Create Vite project with Vue 3 or React 18
    - Install state management (Pinia/Redux Toolkit)
    - Install routing (Vue Router/React Router)
    - Install Axios for HTTP requests
    - Install Tailwind CSS
    - Configure API base URL
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.7_

  - [x] 1.3 Create database migrations for all tables
    - Create users table migration
    - Create game_sessions table migration
    - Create puzzles table migration
    - Create puzzle_progress table migration
    - Create hints table migration
    - Create rankings table migration
    - Add indexes and foreign keys as per schema
    - _Requirements: 8.7, 8.8_

  - [ ]* 1.4 Set up testing frameworks
    - Configure PHPUnit and Pest for backend
    - Configure Vitest/Jest for frontend
    - Install fast-check for property-based testing
    - Create test database configuration
    - _Requirements: Testing Strategy_

- [x] 2. Implement authentication system
  - [x] 2.1 Create User model and authentication backend
    - Create User Eloquent model with fillable fields
    - Implement password hashing with bcrypt (cost 10+)
    - Create RegisterRequest validator (email, username, password rules)
    - Create LoginRequest validator
    - Implement AuthController with register and login methods
    - Configure Laravel Sanctum token issuance
    - Add CSRF protection middleware
    - Implement rate limiting for login attempts (5 attempts per minute)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 10.1, 10.8_

  - [ ]* 2.2 Write property tests for authentication
    - **Property 1: Valid Registration Creates Account**
    - **Validates: Requirements 1.2**
    - **Property 2: Invalid Registration Returns Errors**
    - **Validates: Requirements 1.3**
    - **Property 3: Valid Login Creates Session**
    - **Validates: Requirements 1.6**
    - **Property 4: Invalid Login Returns Error**
    - **Validates: Requirements 1.7**
    - **Property 5: Rate Limiting Blocks Brute Force**
    - **Validates: Requirements 1.9**
    - **Property 28: Password Encryption with Bcrypt**
    - **Validates: Requirements 1.4, 10.1**

  - [x] 2.3 Create authentication UI components
    - Create LoginForm component with email and password fields
    - Create RegisterForm component with validation
    - Implement client-side validation (format checks)
    - Create AuthLayout wrapper component
    - Implement error message display
    - Add loading states during API calls
    - Store auth token in localStorage/sessionStorage
    - _Requirements: 1.1, 1.5, 9.5, 9.6_

  - [ ]* 2.4 Write unit tests for authentication UI
    - Test form validation logic
    - Test error message rendering
    - Test successful login flow
    - Test successful registration flow
    - _Requirements: 1.1, 1.5_

- [x] 3. Checkpoint - Verify authentication system
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement game session management
  - [x] 4.1 Create GameSession model and service layer
    - Create GameSession Eloquent model with relationships
    - Implement GameSessionService with business logic
    - Create TimerService for timer calculations
    - Implement session creation (initial timer: 1500 seconds)
    - Implement single active session constraint per user
    - Implement session sync endpoint (updates time_remaining)
    - Implement session completion logic
    - Implement session abandonment logic
    - _Requirements: 2.1, 2.2, 2.3, 2.9, 8.4_

  - [x] 4.2 Create GameSessionController with API endpoints
    - POST /api/game/start - Create new session
    - GET /api/game/session - Get current session state
    - POST /api/game/sync - Sync timer with server
    - POST /api/game/complete - Mark session as completed
    - POST /api/game/abandon - Abandon current session
    - Add authentication middleware to all endpoints
    - Validate time_remaining on all actions
    - _Requirements: 2.1, 2.4, 2.5, 2.6, 2.7, 2.8, 8.2, 8.6_

  - [ ]* 4.3 Write property tests for game sessions
    - **Property 6: Game Start Creates Session**
    - **Validates: Requirements 2.1**
    - **Property 7: Initial Timer Value**
    - **Validates: Requirements 2.2**
    - **Property 8: Timer Decrements Over Time**
    - **Validates: Requirements 2.3**
    - **Property 9: Single Active Session Per User**
    - **Validates: Requirements 2.9**
    - **Property 10: Game Over Prevents Interactions**
    - **Validates: Requirements 2.6**
    - **Property 11: Completion Triggers Victory**
    - **Validates: Requirements 2.7**
    - **Property 12: Victory Records Completion Time**
    - **Validates: Requirements 2.8**

  - [x] 4.4 Create game session UI components
    - Create GameBoard main container component
    - Create Timer component with countdown display
    - Implement client-side timer with setInterval
    - Implement timer sync with backend every 30 seconds
    - Create ProgressIndicator showing puzzles completed
    - Create GameOver screen component
    - Create Victory screen component with completion time
    - Handle session recovery from localStorage on reconnect
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6, 2.7, 9.1, 9.2_

  - [ ]* 4.5 Write unit tests for game session UI
    - Test timer countdown logic
    - Test timer sync mechanism
    - Test game over state rendering
    - Test victory state rendering
    - _Requirements: 2.3, 2.4, 2.5_

- [x] 5. Checkpoint - Verify game session system
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement puzzle system foundation
  - [x] 6.1 Create Puzzle and PuzzleProgress models
    - Create Puzzle Eloquent model
    - Create PuzzleProgress Eloquent model with relationships
    - Implement puzzle seeder with 10 puzzle types
    - Define solution_data JSON structure for each puzzle type
    - _Requirements: 3.1, 3.6, 8.7_

  - [x] 6.2 Create PuzzleValidatorService
    - Implement validation logic for Symbol Cipher puzzle
    - Implement validation logic for Ritual Pattern puzzle
    - Implement validation logic for Ancient Lock puzzle
    - Implement validation logic for Memory Fragments puzzle
    - Implement validation logic for Cosmic Alignment puzzle
    - Implement validation logic for Tentacle Maze puzzle
    - Implement validation logic for Forbidden Tome puzzle
    - Implement validation logic for Shadow Reflection puzzle
    - Implement validation logic for Cultist Code puzzle
    - Implement validation logic for Elder Sign Drawing puzzle
    - All validation must happen server-side
    - _Requirements: 3.1, 3.3, 3.4, 3.7, 3.8, 10.6_

  - [x] 6.3 Create PuzzleController with API endpoints
    - GET /api/puzzles/{sessionId} - Get current puzzle for session
    - POST /api/puzzles/{puzzleId}/submit - Submit puzzle solution
    - GET /api/puzzles/{puzzleId}/progress - Get puzzle progress
    - Implement sequential puzzle unlocking logic
    - Track time_spent and attempts in puzzle_progress
    - Return appropriate feedback for incorrect solutions
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6, 8.2_

  - [ ]* 6.4 Write property tests for puzzle system
    - **Property 13: Sequential Puzzle Presentation**
    - **Validates: Requirements 3.2**
    - **Property 14: Puzzle Completion Unlocks Next**
    - **Validates: Requirements 3.3, 3.5**
    - **Property 15: Incorrect Solution Provides Feedback**
    - **Validates: Requirements 3.4**
    - **Property 16: Puzzle Time Tracking**
    - **Validates: Requirements 3.6, 4.1**

  - [x] 6.4 Create base puzzle UI components
    - Create PuzzleContainer wrapper component
    - Create puzzle loading state component
    - Create puzzle feedback display (correct/incorrect)
    - Implement puzzle submission handler
    - Add disabled state when game is over
    - _Requirements: 3.1, 3.3, 3.4, 9.1, 9.5_

- [x] 7. Implement individual puzzle components
  - [x] 7.1 Implement Symbol Cipher puzzle
    - Create SymbolCipher component with symbol display
    - Implement text input for decoded word
    - Add visual feedback for submission
    - _Requirements: 3.1, 3.7_

  - [x] 7.2 Implement Ritual Pattern puzzle
    - Create RitualPattern component with draggable items
    - Implement drag-and-drop or click-to-arrange interface
    - Display ritual items with lovecraftian imagery
    - _Requirements: 3.1, 3.7_

  - [x] 7.3 Implement Ancient Lock puzzle
    - Create AncientLock component with combination input
    - Display clues from environment
    - Implement number/symbol input mechanism
    - _Requirements: 3.1, 3.7_

  - [x] 7.4 Implement Memory Fragments puzzle
    - Create MemoryFragments component with card grid
    - Implement card flip animations
    - Track matched pairs
    - _Requirements: 3.1, 3.7_

  - [x] 7.5 Implement Cosmic Alignment puzzle
    - Create CosmicAlignment component with celestial bodies
    - Implement draggable/rotatable elements
    - Display star chart reference
    - _Requirements: 3.1, 3.7_

  - [x] 7.6 Implement Tentacle Maze puzzle
    - Create TentacleMaze component with grid navigation
    - Implement player movement controls
    - Add tentacle obstacles with animations
    - Track path and detect collisions
    - _Requirements: 3.1, 3.7_

  - [x] 7.7 Implement Forbidden Tome puzzle
    - Create ForbiddenTome component with torn pages
    - Implement drag-and-drop page ordering
    - Display page content with ancient text styling
    - _Requirements: 3.1, 3.7_

  - [x] 7.8 Implement Shadow Reflection puzzle
    - Create ShadowReflection component with shadow display
    - Implement movement tracking or input controls
    - Add visual feedback for matching patterns
    - _Requirements: 3.1, 3.7_

  - [x] 7.9 Implement Cultist Code puzzle
    - Create CultistCode component with encoded message
    - Implement frequency analysis tools or cipher input
    - Display decoding progress
    - _Requirements: 3.1, 3.7_

  - [x] 7.10 Implement Elder Sign Drawing puzzle
    - Create ElderSignDrawing component with canvas
    - Implement continuous drawing without lifting cursor
    - Track path accuracy against target pattern
    - Add visual guide overlay
    - _Requirements: 3.1, 3.7_

  - [ ]* 7.11 Write unit tests for puzzle components
    - Test each puzzle component renders correctly
    - Test puzzle interaction handlers
    - Test solution submission
    - Test disabled state
    - _Requirements: 3.1, 3.7_

- [x] 8. Checkpoint - Verify puzzle system
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement hint system
  - [x] 9.1 Create Hint model and service
    - Create Hint Eloquent model
    - Create hint seeder with 3 hints per puzzle (30 total)
    - Implement HintService with availability logic
    - Check time_spent > 120 seconds for hint availability
    - Limit to 3 hints per puzzle
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6_

  - [x] 9.2 Create HintController with API endpoints
    - GET /api/puzzles/{puzzleId}/hints/available - Check hint availability
    - GET /api/puzzles/{puzzleId}/hints/{level} - Get specific hint
    - Track hints_used in puzzle_progress
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [ ]* 9.3 Write property tests for hint system
    - **Property 17: Hint Availability After Timeout**
    - **Validates: Requirements 4.2**
    - **Property 18: Maximum Hints Per Puzzle**
    - **Validates: Requirements 4.5**

  - [x] 9.4 Create hint UI components
    - Create HintPanel component
    - Display hint button when available
    - Show hint notification after 2 minutes
    - Display hint content in modal or panel
    - Track and display hints used count
    - _Requirements: 4.2, 4.3, 4.4, 9.6_

  - [ ]* 9.5 Write unit tests for hint UI
    - Test hint availability display
    - Test hint request handling
    - Test hint content rendering
    - _Requirements: 4.2, 4.3, 4.4_

- [x] 10. Implement ranking system
  - [x] 10.1 Create Ranking model and service
    - Create Ranking Eloquent model
    - Implement RankingService with update logic
    - Implement best time only logic (update if better)
    - Implement rank calculation logic
    - _Requirements: 5.1, 5.5, 5.6, 5.7_

  - [x] 10.2 Create RankingController with API endpoints
    - GET /api/ranking/top - Get top 100 players
    - GET /api/ranking/user/{userId} - Get user's rank
    - Order by completion_time ascending
    - Include username and completion_time in response
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7_

  - [x] 10.3 Integrate ranking updates with game completion
    - Call RankingService when session status becomes 'completed'
    - Create or update ranking entry with completion_time
    - _Requirements: 5.1, 5.5, 5.6_

  - [ ]* 10.4 Write property tests for ranking system
    - **Property 19: Completion Adds to Ranking**
    - **Validates: Requirements 5.1, 5.5**
    - **Property 20: Ranking Sorted by Time**
    - **Validates: Requirements 5.2**
    - **Property 21: Ranking Top 100 Limit**
    - **Validates: Requirements 5.3**
    - **Property 22: Ranking Entry Completeness**
    - **Validates: Requirements 5.4**
    - **Property 23: Best Time Only in Ranking**
    - **Validates: Requirements 5.6**
    - **Property 24: User Rank Calculation**
    - **Validates: Requirements 5.7**

  - [x] 10.5 Create ranking UI components
    - Create Leaderboard component with top 100 list
    - Create RankingEntry component for individual rows
    - Create UserRank component showing current user's position
    - Display username and formatted completion time
    - Add real-time updates (polling or WebSocket)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.7, 5.8_

  - [ ]* 10.6 Write unit tests for ranking UI
    - Test leaderboard rendering
    - Test ranking entry display
    - Test user rank display
    - Test time formatting
    - _Requirements: 5.1, 5.3, 5.4_

- [x] 11. Checkpoint - Verify hint and ranking systems
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement multimedia and atmosphere
  - [x] 12.1 Create lovecraftian visual theme
    - Design dark color palette (blacks, deep purples, greens)
    - Create CSS for cave environment background
    - Add monster imagery and dark themes
    - Implement CSS animations for UI transitions
    - Add particle effects or fog overlays
    - _Requirements: 6.1, 6.2, 6.7_

  - [x] 12.2 Implement audio system
    - Create AmbientAudio component for background sounds
    - Create SoundEffects component for action sounds
    - Add ambient cave sounds (dripping water, wind, whispers)
    - Add puzzle interaction sound effects
    - Add victory and game over sound effects
    - Implement volume controls
    - _Requirements: 6.3, 6.4_

  - [x] 12.3 Create cinematic system
    - Create Cinematic component for video/animation playback
    - Implement opening cinematic (game start)
    - Implement victory cinematic (game completion)
    - Add skip button for cinematics
    - Ensure cinematics are responsive
    - _Requirements: 6.5, 6.6_

  - [x] 12.4 Add JavaScript animations
    - Implement puzzle transition animations
    - Add timer warning animations (last 5 minutes)
    - Create victory celebration animations
    - Add game over dramatic effects
    - _Requirements: 6.7, 6.8_

  - [ ]* 12.5 Integrate AI-generated content (optional)
    - Add AI-generated lovecraftian images for puzzles
    - Add AI-generated ambient audio tracks
    - Add AI-generated monster imagery
    - _Requirements: 6.9_

- [x] 13. Implement responsive design
  - [x] 13.1 Create responsive layouts
    - Implement mobile layout (320px - 767px)
    - Implement tablet layout (768px - 1023px)
    - Implement desktop layout (1024px+)
    - Use CSS Grid and Flexbox for fluid layouts
    - _Requirements: 7.1, 7.3_

  - [x] 13.2 Optimize for touch devices
    - Implement touch-friendly controls for all puzzles
    - Increase button sizes for mobile (min 44x44px)
    - Add touch gestures where appropriate (swipe, pinch)
    - Test all interactions on touch devices
    - _Requirements: 7.2_

  - [x] 13.3 Optimize assets for different screens
    - Create responsive images with srcset
    - Implement lazy loading for images
    - Optimize bundle size with code splitting
    - Test on various screen resolutions
    - _Requirements: 7.5, 9.8_

  - [ ]* 13.4 Test cross-browser compatibility
    - Test on Chrome (latest)
    - Test on Firefox (latest)
    - Test on Safari (latest)
    - Test on Edge (latest)
    - Fix any browser-specific issues
    - _Requirements: 7.6_

- [x] 14. Implement security measures
  - [x] 14.1 Implement input sanitization
    - Add XSS protection to all user inputs
    - Sanitize username and email on registration
    - Use Laravel's built-in sanitization helpers
    - Implement Content Security Policy headers
    - _Requirements: 10.3_

  - [x] 14.2 Implement SQL injection prevention
    - Use Eloquent ORM for all database queries
    - Use parameterized queries where raw SQL is needed
    - Validate all input types and ranges
    - _Requirements: 10.4_

  - [x] 14.3 Configure HTTPS and CORS
    - Configure HTTPS for production environment
    - Set up CORS policies to restrict API access
    - Configure allowed origins for frontend domain
    - _Requirements: 10.2, 10.5_

  - [x] 14.4 Implement session timeout
    - Configure session timeout to 2 hours (7200 seconds)
    - Implement automatic logout on timeout
    - Display session expiration warning
    - _Requirements: 10.7_

  - [ ]* 14.5 Write property tests for security
    - **Property 25: Request Validation**
    - **Validates: Requirements 8.3**
    - **Property 26: Protected Routes Require Authentication**
    - **Validates: Requirements 8.6**
    - **Property 29: XSS Input Sanitization**
    - **Validates: Requirements 10.3**
    - **Property 30: Server-Side Game Validation**
    - **Validates: Requirements 10.6**
    - **Property 31: Session Timeout After Inactivity**
    - **Validates: Requirements 10.7**
    - **Property 32: Authentication Attempt Logging**
    - **Validates: Requirements 10.8**

- [x] 15. Implement error handling and logging
  - [x] 15.1 Configure backend error handling
    - Customize Laravel exception handler
    - Implement structured error responses
    - Configure logging levels and channels
    - Add error logging for all exceptions
    - Hide sensitive information in production
    - _Requirements: 8.5_

  - [x] 15.2 Implement frontend error handling
    - Create error boundary components
    - Display user-friendly error messages
    - Implement retry logic for failed requests
    - Handle network errors gracefully
    - Log errors to monitoring service
    - _Requirements: 9.6_

  - [ ]* 15.3 Write property tests for error handling
    - **Property 27: Data Persistence Round Trip**
    - **Validates: Requirements 8.7**

- [x] 16. Integration and final wiring
  - [x] 16.1 Wire all components together
    - Connect authentication flow to game session
    - Connect game session to puzzle system
    - Connect puzzle completion to ranking updates
    - Ensure all API endpoints are integrated
    - Test complete user journey from registration to completion
    - _Requirements: All requirements_

  - [x] 16.2 Implement state persistence
    - Save game session ID to localStorage
    - Implement session recovery on page reload
    - Handle browser back/forward navigation
    - Clear state on logout
    - _Requirements: 2.1, 9.2_

  - [x] 16.3 Optimize performance
    - Implement API response caching where appropriate
    - Optimize database queries with eager loading
    - Minimize bundle size with tree shaking
    - Implement loading skeletons for better UX
    - _Requirements: 9.8_

  - [ ]* 16.4 Write integration tests
    - Test complete authentication flow
    - Test complete game flow (start to victory)
    - Test complete game flow (start to timeout)
    - Test ranking update after completion
    - Test session recovery after disconnect
    - _Requirements: All requirements_

- [x] 17. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation and allow for user feedback
- The implementation follows a layered approach: infrastructure → core systems → features → polish
- All game validation must happen server-side to prevent cheating
- Frontend should provide immediate feedback but always defer to backend for authoritative state
