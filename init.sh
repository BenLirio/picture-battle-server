#!/bin/bash

# Script to set up a TypeScript project with Serverless Framework 4.0+
# Author: Claude
# Date: May 3, 2025

# Exit on any error
set -e

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "\n${BLUE}=========================================${NC}"
echo -e "${BLUE}  Serverless TypeScript Project Setup  ${NC}"
echo -e "${BLUE}=========================================${NC}\n"

# Check if project name was provided
if [ $# -eq 0 ]; then
  read -p "Enter your project name: " PROJECT_NAME
else
  PROJECT_NAME=$1
fi

# Create project directory
echo -e "\n${YELLOW}Creating project directory...${NC}"
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Initialize npm project
echo -e "\n${YELLOW}Initializing npm project...${NC}"
npm init -y

# Update package.json
echo -e "\n${YELLOW}Updating package.json...${NC}"
# Use node to update package.json programmatically
node -e "
const fs = require('fs');
const pkg = require('./package.json');
pkg.scripts = {
  ...pkg.scripts,
  'deploy': 'serverless deploy',
  'deploy:prod': 'serverless deploy --stage production',
  'start:dev': 'serverless offline start',
  'lint': 'eslint . --ext .ts',
  'test': 'jest'
};
pkg.engines = { node: '>=18.0.0' };
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
"

# Install Serverless globally if not already installed
echo -e "\n${YELLOW}Checking if Serverless is installed globally...${NC}"
if ! command -v serverless &> /dev/null; then
  echo -e "Serverless Framework not found, installing globally..."
  npm install -g serverless
fi

# Check Serverless version
SLS_VERSION=$(serverless --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
MAJOR_VERSION=$(echo $SLS_VERSION | cut -d. -f1)

if [ "$MAJOR_VERSION" -lt 4 ]; then
  echo -e "${YELLOW}Updating Serverless to version 4.x...${NC}"
  npm install -g serverless@latest
fi

# Install dependencies
echo -e "\n${YELLOW}Installing dependencies...${NC}"
npm install --save-dev typescript \
  @types/node \
  @types/aws-lambda \
  serverless-offline \
  eslint \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  jest \
  ts-jest \
  @types/jest

# Install AWS SDK as a dependency
npm install --save @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb

# Create serverless.yml configuration
echo -e "\n${YELLOW}Creating serverless.yml configuration...${NC}"
cat > serverless.yml << EOL
service: ${PROJECT_NAME}

frameworkVersion: '4'

provider:
  name: aws
  runtime: nodejs18.x
  stage: \${opt:stage, 'dev'}
  region: \${opt:region, 'us-east-1'}
  memorySize: 1024
  timeout: 10
  environment:
    NODE_ENV: \${self:provider.stage}

# Serverless Framework v4 has native TypeScript support!
# The "build" config is optional and can be customized if needed
build:
  esbuild:
    bundle: true
    minify: false
    sourcemap: true
    exclude:
      - aws-sdk
    target: 'node18'
    define:
      'process.env.NODE_ENV': "'$(NODE_ENV)'"
    platform: 'node'
    concurrency: 10

functions:
  hello:
    handler: src/handlers/hello.handler
    events:
      - http:
          path: /hello
          method: get
          cors: true

plugins:
  - serverless-offline

custom:
  serverless-offline:
    httpPort: 3000
    lambdaPort: 3002
EOL

# Create tsconfig.json
echo -e "\n${YELLOW}Creating TypeScript configuration...${NC}"
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "lib": ["ES2022"],
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": ".build"
  },
  "include": ["src/**/*", "__tests__/**/*"],
  "exclude": ["node_modules", ".serverless", ".build"]
}
EOL

# Create folder structure
echo -e "\n${YELLOW}Creating folder structure...${NC}"
mkdir -p src/handlers
mkdir -p src/services
mkdir -p src/types
mkdir -p __tests__

# Create ESLint configuration
echo -e "\n${YELLOW}Creating ESLint configuration...${NC}"
cat > .eslintrc.json << EOL
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "env": {
    "node": true,
    "jest": true
  },
  "rules": {
    "no-console": "warn",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
EOL

# Create Jest configuration
echo -e "\n${YELLOW}Creating Jest configuration...${NC}"
cat > jest.config.js << EOL
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testRegex: '/__tests__/.*\\.(test|spec)\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
EOL

# Create a sample Lambda function
echo -e "\n${YELLOW}Creating sample Lambda function...${NC}"
cat > src/handlers/hello.ts << EOL
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Sample Lambda function that returns a greeting
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const queryParams = event.queryStringParameters || {};
    const name = queryParams.name || 'World';
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: `Hello, ${name}!`,
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Error in handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({
        message: 'Internal Server Error',
      }),
    };
  }
};
EOL

# Create a sample test for the Lambda function
echo -e "\n${YELLOW}Creating sample test...${NC}"
cat > __tests__/hello.test.ts << EOL
import { handler } from '../src/handlers/hello';
import { APIGatewayProxyEvent } from 'aws-lambda';

describe('Hello Lambda Function', () => {
  it('should return a 200 response with default greeting', async () => {
    // Create mock API Gateway event
    const mockEvent = {
      queryStringParameters: {},
    } as APIGatewayProxyEvent;

    // Call the handler function
    const response = await handler(mockEvent);

    // Assertions
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Hello, World!');
    expect(body.timestamp).toBeDefined();
  });

  it('should return a personalized greeting when name is provided', async () => {
    // Create mock API Gateway event with query parameters
    const mockEvent = {
      queryStringParameters: {
        name: 'Serverless',
      },
    } as APIGatewayProxyEvent;

    // Call the handler function
    const response = await handler(mockEvent);

    // Assertions
    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.message).toEqual('Hello, Serverless!');
  });
});
EOL

# Create .gitignore
echo -e "\n${YELLOW}Creating .gitignore...${NC}"
cat > .gitignore << EOL
# Dependencies
node_modules

# Serverless
.serverless
.build

# TypeScript
*.js.map
*.d.ts

# Testing
coverage

# Environment variables
.env
.env.*

# Logs
logs
*.log
npm-debug.log*

# IDE
.idea
.vscode
*.swp
*.swo

# OS specific
.DS_Store
EOL

# Create README.md
echo -e "\n${YELLOW}Creating README.md...${NC}"
cat > README.md << EOL
# ${PROJECT_NAME}

A serverless TypeScript project using Serverless Framework v4+.

## Prerequisites

- Node.js 18 or later
- AWS CLI configured with appropriate credentials

## Installation

\`\`\`bash
npm install
\`\`\`

## Local Development

Start the local development server:

\`\`\`bash
npm run start:dev
\`\`\`

This will start the Serverless Offline service at http://localhost:3000.

Test the function:

\`\`\`
curl http://localhost:3000/hello
curl http://localhost:3000/hello?name=YourName
\`\`\`

## Running Tests

\`\`\`bash
npm test
\`\`\`

## Deployment

### Deploy to Development Stage

\`\`\`bash
npm run deploy
\`\`\`

### Deploy to Production Stage

\`\`\`bash
npm run deploy:prod
\`\`\`

## Project Structure

- \`src/handlers/\` - Lambda function handlers
- \`src/services/\` - Business logic and services
- \`src/types/\` - TypeScript type definitions
- \`__tests__/\` - Test files

## Documentation

- [Serverless Framework](https://www.serverless.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [AWS Lambda](https://aws.amazon.com/lambda/)
EOL

# Final output
echo -e "\n${GREEN}=========================================${NC}"
echo -e "${GREEN}  Project setup complete!  ${NC}"
echo -e "${GREEN}=========================================${NC}"
echo -e "\nProject '${PROJECT_NAME}' has been created successfully.\n"
echo -e "To get started:"
echo -e "  cd ${PROJECT_NAME}"
echo -e "  npm run start:dev - Start local development server"
echo -e "  npm test - Run tests"
echo -e "  npm run deploy - Deploy to AWS (dev stage)"
echo -e "  npm run deploy:prod - Deploy to AWS (production stage)\n"
echo -e "Happy coding! 🚀\n"