# Innovature Backend Assignment Task 2

- Framework : Nest.js with Express Adapter

## Features

- User CRUD Operation : Create, Read, Update, Delete
- Database Integration
- File Operations : Upload, Signed Download Link Generation, Deletion.
- Validation : File Limit of 100 mb, Only Image Files Allowed.

## API Endpoints

### User Operations

Create User : **POST**   : /users/

Update User : **PATCH**  : /users/{{user-id}}

Delete User : **DELETE** : /users/{{user-id}}

Fetch User  : **GET**    : /users/profile

### Auth Operations

User Login    : **POST**    : /auth/login

Refresh Token : **POST**    : /auth/refresh

### File Operations

Upload Files      : **POST**    : /files/upload

Fetch User Files  : **GET**     : /files/my-files

Generate  Link    : **GET**     : /files/generate-link/{{file-id}}

Delete File       : **DELETE**  : /files/{{file-id}}

## How To Test Backend?

- Clone the Repository
- Install Dependencies : `npm install`
- Start Server : `npm run start:dev`
- Import the postman collection to postman app.
- Test Each endpoint with necessary header or body.

