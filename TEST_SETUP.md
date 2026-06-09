# Testing Setup Guide

This project uses **Vitest** with **React Testing Library** for client tests and **supertest** for server API tests.

## Installation

Dependencies are already installed:
```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom supertest
```

## Running Tests

### Client Tests (from root directory)
```bash
npm test                 # Run all tests
npm run test:ui        # Run tests with UI dashboard
npm run test:coverage  # Generate coverage report
```

### Server Tests (from Server directory)
```bash
cd Server
npm test               # Run API tests
npm run test:coverage  # Generate coverage report
```

## Test Files Structure

### Client Tests
- `src/test/setup.js` - Test configuration and mocks
- `src/test/Navigation.test.jsx` - Navigation component tests
- `src/test/GlobalLeaderboard.test.jsx` - Leaderboard component tests

### Server Tests
- `Server/__tests__/api.test.js` - API endpoint tests
- `Server/vitest.config.js` - Server test configuration

## Test Coverage

Coverage reports are generated in:
- Client: `coverage/` directory (after running `npm run test:coverage`)
- Server: `Server/coverage/` directory

View the HTML report by opening `coverage/index.html` in a browser.

## Adding New Tests

### For React Components:
```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render text', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### For API Endpoints:
```js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const app = require('../server.js');

describe('API', () => {
  it('should fetch data', async () => {
    const response = await request(app).get('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

## CI/CD Integration

To run tests in CI/CD pipelines:
```bash
npm test -- --run          # Run once and exit
npm run test:coverage      # Generate coverage reports
```

## Troubleshooting

**Act() Warnings**: These warnings appear when React state updates happen outside of `act()`. They're not test failures but best practice reminders. The tests should still pass.

**MongoDB Connection in Tests**: Tests skip database operations by default. Mock the database if needed.

**Coverage Not Generated**: Ensure `@vitest/ui` is installed and run `npm run test:coverage`.
