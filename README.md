# Smart File Vault - Backend Notes

## Project Structure
- The backend code is located in the `backend/` directory.
- It is a Node.js application using the Express.js framework.

## Key Dependencies
- `express`: Web server framework.
- `mongoose`: ODM for interacting with MongoDB.
- `jsonwebtoken`: For creating and verifying JWTs for authentication.
- `bcryptjs`: For hashing user passwords.
- `multer`: For handling file uploads.
- `crypto`: For encrypting and decrypting files using AES-256.
- `dotenv`: For managing environment variables.

## Core Features
1.  **Secure User Authentication**:
    -   User signup with password hashing (bcrypt).
    -   User login and JWT generation.
    -   Protected routes using JWT middleware.

2.  **Encrypted File Storage**:
    -   Files are uploaded via a REST API.
    -   Each file is encrypted using AES-256-CBC with a unique encryption key and IV.
    -   The encrypted file is stored on the server's filesystem in the `uploads/` directory.
    -   File metadata (including the IV and key) is stored in MongoDB.

3.  **Expiring Shareable Links**:
    -   Users can generate secure, time-limited links to share their files.
    -   These links expire after 24 hours.

## API Endpoints
- `POST /api/auth/signup`: Register a new user.
- `POST /api/auth/login`: Log in a user and get a JWT.
- `POST /api/files/upload`: Upload and encrypt a file (protected).
- `GET /api/files`: List all files for the authenticated user (protected).
- `GET /api/files/download/:id`: Download and decrypt a file (protected).
- `POST /api/files/share/:id`: Generate an expiring share link (protected).
- `GET /api/files/download/shared/:token`: Download a file using a public share link.

## Environment Variables
- A `.env` file is required in the `backend/` directory with the following variables:
  - `MONGO_URI`: Your MongoDB connection string.
  - `JWT_SECRET`: A secret key for signing JWTs.
  - `PORT`: The port for the backend server (e.g., 5000).

## Directory Layout
- `backend/`
  - `middleware/`: Contains authentication middleware.
  - `models/`: Contains Mongoose data models (User, File).
  - `node_modules/`: Project dependencies.
  - `routes/`: Contains API route definitions.
  - `uploads/`: Where encrypted files are stored.
  - `.env`: Environment variables file.
  - `.gitignore`: Specifies files to be ignored by Git.
  - `index.js`: The main application entry point.
  - `package.json`: Project metadata and dependencies.
  - `package-lock.json`: Records the exact version of each dependency. 