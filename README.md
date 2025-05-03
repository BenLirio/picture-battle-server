# picture-battle-server

A serverless TypeScript project using Serverless Framework v4+.

## Prerequisites

- Node.js 18 or later
- AWS CLI configured with appropriate credentials

## Installation

```bash
npm install
```

## Local Development

Start the local development server:

```bash
npm run start:dev
```

This will start the Serverless Offline service at http://localhost:3000.

Test the function:

```
curl http://localhost:3000/hello
curl http://localhost:3000/hello?name=YourName
```

## Running Tests

```bash
npm test
```

## Deployment

### Deploy to Development Stage

```bash
npm run deploy
```

### Deploy to Production Stage

```bash
npm run deploy:prod
```

## Project Structure

- `src/handlers/` - Lambda function handlers
- `src/services/` - Business logic and services
- `src/types/` - TypeScript type definitions
- `__tests__/` - Test files

## Documentation

- [Serverless Framework](https://www.serverless.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
