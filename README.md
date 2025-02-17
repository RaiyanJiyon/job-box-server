# Job Box Backend

This is the backend server for the **Job Box** application, a job listing and application platform. The backend is built using **Node.js**, **Express.js**, and **MongoDB**. It provides various API endpoints for job listings, job applications, user management, and related functionalities.

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
  - [Jobs](#jobs)
  - [Applied Jobs](#applied-jobs)
  - [Saved Jobs](#saved-jobs)
  - [Users](#users)
- [Dependencies](#dependencies)
- [License](#license)

---

## Installation

1. Clone the repository:

   ```sh
   git clone https://github.com/RaiyanJiyon/job-box-server.git
   cd job-box-server
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB credentials:

   ```
   DB_USER=<your_mongodb_username>
   DB_PASS=<your_mongodb_password>
   ```

4. Start the server:

   ```sh
   npm start
   ```

---

## Configuration

The server runs on **port 5000** by default. You can modify this in `index.js`:

```js
const port = 5000;
```

Environment variables:

- `DB_USER` - MongoDB username
- `DB_PASS` - MongoDB password

---

## Usage

Once the server is running, you can use the following API endpoints.

### Base URL

```
http://localhost:5000
```

---

## API Endpoints

### Jobs

- **Get all jobs**
  ```
  GET /jobs
  ```
- **Get jobs with pagination and search**
  ```
  GET /jobs-by-pagination?page=1&limit=10&search=developer
  ```
- **Get a job by ID**
  ```
  GET /jobs/:id
  ```
- **Get jobs applied by user email**
  ```
  GET /jobs/applied-by-email/:email
  ```
- **Get featured jobs**
  ```
  GET /featured-jobs
  ```
- **Add a new job**
  ```
  POST /jobs
  ```
- **Delete a job by ID**
  ```
  DELETE /jobs/:id
  ```

---

### Applied Jobs

- **Get applied jobs by user ID**
  ```
  GET /applied-jobs/:userId
  ```
- **Get applied jobs by company email**
  ```
  GET /applied-jobs/by-company-email/:companyEmail
  ```
- **Apply for a job**
  ```
  POST /applied-jobs
  ```
- **Delete an applied job**
  ```
  DELETE /applied-jobs/:id
  ```

---

### Saved Jobs

- **Get saved jobs by user ID**
  ```
  GET /saved-jobs/:userId
  ```
- **Save a job**
  ```
  POST /saved-jobs
  ```
- **Delete a saved job**
  ```
  DELETE /saved-jobs/:savedJobId
  ```

---

### Users

- **Get all users (with search)**
  ```
  GET /users?email=test@example.com&name=John
  ```
- **Get a user by email**
  ```
  GET /users/:email
  ```
- **Add a new user**
  ```
  POST /users
  ```
- **Update a user's role**
  ```
  PATCH /users/:id
  ```
- **Delete a user**
  ```
  DELETE /users/:id
  ```

---

## Dependencies

- **express**: Web framework for Node.js
- **cors**: Middleware for enabling CORS
- **dotenv**: Loads environment variables
- **mongodb**: MongoDB client for Node.js

Install dependencies using:

```sh
npm install
```

---

## License

This project is licensed under the MIT License.

---

## Author

Developed by **Raiyan Jiyon**. Feel free to contribute or report issues!