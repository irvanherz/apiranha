# Apiranha

Apiranha is a serverless application built using AWS SAM (Serverless Application Model) and hosted on AWS. It provides API services, including CRUD operations for users and API keys, as well as a screenshot website URL service. The project uses DynamoDB with a single-table design pattern to follow best practices for scalability and performance.

## Tech Stack

- **AWS Lambda**: Handles the business logic for all API operations.
- **API Gateway**: Acts as the entry point for all API requests.
- **DynamoDB**: A fully managed NoSQL database, used with a single-table design pattern.
- **S3**: Used for storing captured screenshots and other static assets.
- **AWS SAM**: Used for defining and deploying the serverless application.
- **TypeScript**: The primary language used for development.
- **Puppeteer**: A headless browser for capturing website screenshots.
- **ESBuild**: The SAM build method used for compiling TypeScript into JavaScript for Lambda functions.

## Features

1. **User Management**:
   - Create, Read, Update, and Delete (CRUD) operations for user data.
   - API endpoints for managing user details.

2. **API Key Management**:
   - CRUD operations for managing API keys.
   - Secure access to specific services provided by Apiranha.

3. **Screenshot Website URL Service**:
   - Capture and return screenshots of provided URLs using Puppeteer.
   - Store screenshots in S3 for easy access.
   - Available to users via their API keys.

## Getting Started

### Prerequisites

To run and deploy Apiranha, ensure you have the following installed:
- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS SAM CLI](https://aws.amazon.com/serverless/sam/)
- Node.js (for handling dependencies)
- AWS Account
- Docker (for running Lambda functions locally)
- TypeScript (for development)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/apiranha.git
   cd apiranha
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **SAM CLI Local Setup:**
   - Setup JWT secret (JwtSecretParameter) in samconfig.toml
     ```toml
     parameter_overrides = "JwtSecretParameter=BHUHnjiunuiUUIN65778"
     ```
   - To test locally, you can run the SAM local environment with Docker. Ensure Docker is running, then use:
     ```bash
     sam local start-api
     ```
   - Access the API at: `http://localhost:3000`

4. **Deploying to AWS:**
   - Build the SAM application using ESBuild:
     ```bash
     sam build --use-container
     ```
   - Deploy the application:
     ```bash
     sam deploy --guided
     ```
   - Follow the prompts to provide a stack name and other configuration details. SAM will generate the necessary CloudFormation templates and deploy the stack.

### DynamoDB Table Design

This application follows the **Single-Table Design** pattern for DynamoDB, ensuring that all data for users, API keys, and screenshots are stored efficiently in one table. This allows for quick querying and retrieval of related entities, improving the overall performance and scalability of the app.

### API Endpoints

| Method | Endpoint                  | Description                       |
| ------ | ------------------------- | --------------------------------- |
| POST   | `/users`                  | Create a new user                 |
| GET    | `/users/{userId}`         | Get details of a specific user    |
| PUT    | `/users/{userId}`         | Update user information           |
| DELETE | `/users/{userId}`         | Delete a user                     |
| POST   | `/api-keys`               | Create a new API                  |
| GET    | `/api-keys`               | List all API keys                 |
| GET    | `/users/{userId}/apikeys` | List all user API keys            |
| PUT    | `/api-keys/{keyId}`       | Update API key information        |
| DELETE | `/apikeys/{keyId}`        | Delete a specific API key         |
| POST   | `/api/screenshot-url`     | Capture a screenshot of a website |

### Testing

Unit tests for Lambda functions can be written using your preferred testing framework. SAM provides a local testing environment with the following command:
```bash
sam local invoke <FunctionName>
```

### Security

Apiranha ensures security by requiring API keys for accessing the screenshot service and user APIs. It’s recommended to further enhance security by integrating AWS Cognito or IAM for access control and monitoring usage with AWS CloudWatch.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
