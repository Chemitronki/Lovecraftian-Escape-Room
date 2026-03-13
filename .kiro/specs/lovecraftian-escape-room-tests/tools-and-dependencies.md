# Tools and Dependencies Configuration

## Backend Testing Stack (Laravel/PHPUnit)

### Core Dependencies

```json
{
  "require-dev": {
    "phpunit/phpunit": "^10.0",
    "laravel/pint": "^1.0",
    "laravel/sail": "^1.0",
    "mockery/mockery": "^1.5",
    "fakerphp/faker": "^1.20"
  }
}
```

### Installation

```bash
# Install dependencies
composer require --dev phpunit/phpunit laravel/pint mockery/mockery fakerphp/faker

# Publish PHPUnit configuration
php artisan vendor:publish --provider="PHPUnit\Framework\TestCase"
```

### Key Libraries

- **PHPUnit**: Testing framework (included with Laravel)
- **Mockery**: Mocking library for creating test doubles
- **Faker**: Generates fake data for tests
- **Laravel Testing Utilities**: Built-in helpers for HTTP testing, database testing, etc.

## Frontend Testing Stack (React/Vitest)

### Core Dependencies

```json
{
  "devDependencies": {
    "vitest": "^0.34.0",
    "@vitest/ui": "^0.34.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "jsdom": "^22.0.0",
    "fast-check": "^3.0.0"
  }
}
```

### Installation

```bash
# Install dependencies
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react jsdom fast-check

# Install Redux testing utilities
npm install --save-dev @testing-library/redux redux-mock-store
```

### Key Libraries

- **Vitest**: Fast unit test framework (Vite-native)
- **React Testing Library**: Testing utilities for React components
- **jsdom**: DOM implementation for Node.js
- **fast-check**: Property-based testing library
- **Redux Mock Store**: Mock Redux store for testing

## Integration Testing Stack

### Core Dependencies

```json
{
  "devDependencies": {
    "axios": "^1.4.0",
    "playwright": "^1.40.0",
    "@playwright/test": "^1.40.0"
  }
}
```

### Installation

```bash
# Install dependencies
npm install --save-dev axios playwright @playwright/test

# Install Playwright browsers
npx playwright install
```

### Key Libraries

- **Axios**: HTTP client for API testing
- **Playwright**: E2E testing framework
- **@playwright/test**: Playwright test runner

## Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:integration": "vitest run tests/Integration",
    "test:e2e": "playwright test",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Laravel Configuration Files

### .env.testing

```env
APP_NAME="Lovecraftian Escape Room"
APP_ENV=testing
APP_KEY=base64:test_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=lovecraftian_test
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=array
QUEUE_CONNECTION=sync
SESSION_DRIVER=array

SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

### phpunit.xml (Complete)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="https://schema.phpunit.de/10.0/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         cacheResultFile=".phpunit.cache/test-results"
         executionOrder="depends,defects"
         forceCoversAfterClassToOnlyMethods="false"
         beStrictAboutCoverageMetadata="false"
         beStrictAboutOutputDuringTests="true"
         beStrictAboutTestsThatDoNotTestAnything="true"
         beStrictAboutTodoTestedCode="true"
         failOnRisky="true"
         failOnWarning="true"
         verbose="true">
    <testsuites>
        <testsuite name="Unit">
            <directory suffix="Test.php">tests/Backend/Unit</directory>
        </testsuite>
        <testsuite name="Feature">
            <directory suffix="Test.php">tests/Backend/Feature</directory>
        </testsuite>
        <testsuite name="Database">
            <directory suffix="Test.php">tests/Backend/Database</directory>
        </testsuite>
        <testsuite name="Security">
            <directory suffix="Test.php">tests/Security</directory>
        </testsuite>
        <testsuite name="Performance">
            <directory suffix="Test.php">tests/Performance</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">app</directory>
        </include>
        <exclude>
            <directory>app/Console</directory>
            <directory>app/Http/Middleware</directory>
            <directory>app/Providers</directory>
        </exclude>
        <report>
            <html outputDirectory="coverage/html"/>
            <text outputFile="php://stdout" showUncoveredFiles="true"/>
        </report>
    </coverage>
    <php>
        <ini name="error_reporting" value="-1"/>
        <ini name="display_errors" value="On"/>
        <ini name="display_startup_errors" value="On"/>
        <env name="APP_ENV" value="testing"/>
        <env name="CACHE_DRIVER" value="array"/>
        <env name="SESSION_DRIVER" value="array"/>
        <env name="QUEUE_CONNECTION" value="sync"/>
        <env name="DB_CONNECTION" value="mysql"/>
        <env name="DB_DATABASE" value="lovecraftian_test"/>
    </php>
</phpunit>
```

## Vitest Configuration (Complete)

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '**/*.d.ts',
        '**/index.ts',
      ],
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80,
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### tests/setup.ts

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

// Mock fetch
global.fetch = vi.fn();
```

## Playwright Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/Frontend/E2E',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Database Setup for Testing

### Create Test Database

```bash
# MySQL
mysql -u root -p -e "CREATE DATABASE lovecraftian_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Or using Laravel
php artisan migrate --env=testing
```

### Database Seeding for Tests

```php
// database/seeders/TestSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Game;
use App\Models\Puzzle;

class TestSeeder extends Seeder
{
    public function run(): void
    {
        // Create test games
        $game = Game::create([
            'name' => 'Test Game',
            'description' => 'A test escape room game',
            'difficulty' => 'medium',
        ]);

        // Create test puzzles
        for ($i = 1; $i <= 5; $i++) {
            Puzzle::create([
                'game_id' => $game->id,
                'order' => $i,
                'description' => "Puzzle {$i}",
                'puzzle_type' => 'riddle',
                'solution' => "answer{$i}",
                'media_urls' => json_encode(["https://example.com/puzzle{$i}.jpg"]),
            ]);
        }
    }
}
```

## Running Tests in CI/CD

### GitHub Actions Workflow

```yaml
name: Complete Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: lovecraftian_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          extensions: mysql, pdo_mysql
          
      - name: Install Composer dependencies
        run: composer install --no-progress --prefer-dist
        
      - name: Copy .env.testing
        run: cp .env.testing .env
        
      - name: Generate app key
        run: php artisan key:generate --env=testing
        
      - name: Run migrations
        run: php artisan migrate --env=testing
        
      - name: Run backend tests
        run: php artisan test --testsuite=Feature,Unit,Database,Security,Performance
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage.xml

  frontend-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run frontend tests
        run: npm run test:run
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage.json

  integration-tests:
    runs-on: ubuntu-latest
    needs: [backend-tests, frontend-tests]
    
    services:
      mysql:
        image: mysql:8
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: lovecraftian_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install PHP dependencies
        run: composer install --no-progress --prefer-dist
        
      - name: Install Node dependencies
        run: npm ci
        
      - name: Setup Laravel
        run: |
          cp .env.testing .env
          php artisan key:generate --env=testing
          php artisan migrate --env=testing
          
      - name: Start Laravel server
        run: php artisan serve &
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Run E2E tests
        run: npm run test:e2e

  code-quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.2'
          
      - name: Install Composer dependencies
        run: composer install --no-progress --prefer-dist
        
      - name: Run PHP linting
        run: ./vendor/bin/pint --test
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install Node dependencies
        run: npm ci
        
      - name: Run ESLint
        run: npm run lint
```

## Local Development Setup

### Quick Start

```bash
# Backend setup
cd backend
composer install
cp .env.testing .env
php artisan key:generate
php artisan migrate
php artisan test

# Frontend setup
cd frontend
npm install
npm run test:run

# Integration tests
npm run test:integration
```

### Watch Mode for Development

```bash
# Backend - watch for changes
php artisan test --watch

# Frontend - watch for changes
npm run test:watch

# E2E tests - watch mode
npm run test:e2e --headed --watch
```

## Coverage Reports

### Generating Coverage Reports

```bash
# Backend coverage
php artisan test --coverage

# Frontend coverage
npm run test:coverage

# View HTML reports
# Backend: coverage/html/index.html
# Frontend: coverage/index.html
```

### Coverage Thresholds

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

