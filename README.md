<div align="center">
  <h1 align="center">Login & Register Feature</h1>
  <h3>A authentication system that allows users to register, log in, and perform authenticated actions with some advanced features</h3>
</div>

## Main Features
- **User Registration:**
  - **Validation:**
    * **Username:** Required, must be unique
    * **Email:** Required, must be unique, must be in a valid email format
    * **Password:**  Required, minimum length of 8 characters
  - **Successful Registration:**
    * Password will be securely stored using a hashed version
    * Returns a success message along with the new user's details (excluding password)

- **User Login (Passport):**
  - **Users log in by providing Email or Username and Password**
  - **If authentication is successful:**
    * Return a success message and a JWT (JSON Web Token) for authenticated requests
    * The token will be valid for a certain time (e.g., 24 hours)
    
- **Authentication Middleware (@UseGuard + Passport AuthGuard):**
  - **Implement middleware to protect certain routes, allowing only authenticated users to access them**
  - **If an invalid or expired token is used, return an unauthorized error**


## Advanced Features
- **Password Reset (Nodemailer):**
  - Implement a password reset feature where users can request to reset their password using their email
  - Send an email with a verification code that expire after 15 minutes. User will use it to set new password in password reset page

- **User Roles and Permissions (@Roles + RolesGuard):**
  - Implement basic roles such as admin and user.
  - Certain routes will be accessible only to users with admin role

- **Rate Limiting for Login (ThrottleModule):**
  - Rate limiting for endpoints to prevent brute force attacks. E.g., allow only 5 login attempts per minute

- **Two-Factor Authentication (AuthController and AuthService functions):**
  - Allow users to enable 2FA during login using a time-based one-time password from Authenticator apps

- **Activity Logging (@ActivityLogInterceptor):**
  - Log user activities, store the timestamp and IP address for each request

## Demo
<img src="public/2FA.gif" width="840" alt="Demo">
<br>
<br>
<img src="public/PasswordReset.gif" width="840" alt="Demo">
<br>
<br>

## Tech Stack
<table>
  <tr>
    <td align="center" width="160">
      <img src="https://img.shields.io/badge/-NestJs-ea2845?style=flat-square&logo=nestjs&logoColor=white" alt="Spring Boot" width="140" height="40"/>
    </td>
    <td>
      <b>NestJS:</b> Backend NodeJS framework for RESTful APIs and Database ORM.
    </td>
  </tr>
  <tr>
    <td align="center" width="160">
      <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="PostgreSQL" width="140" height="40"/>
    </td>
    <td>
      <b>Next.JS:</b> Frontend ReactJS framework for easy ui development and routing page
    </td>
  </tr>
  <tr>
    <td align="center" width="160">
      <img src="https://img.shields.io/badge/-MongoDB-13aa52?style=for-the-badge&logo=mongodb&logoColor=white" alt="PostgreSQL" width="140" height="40"/>
    </td>
    <td>
      <b>MongoDB:</b> Full cloud-based NoSQL data platform and flexible document schemas
    </td>
  </tr>
</table>



## Getting Started

### Prerequisites

Here's what you need to be able to run this source:
- Node.js (version >= 18)
- MongoDB Cluster and Database (Create at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### 1. Clone the repository

```shell
git clone https://github.com/chuhaiphu/saigon-digital-assessment.git
```

### 2. Install dependencies
In backend (be) directory
```shell
yarn install
```

### 3. Configure environment variables
Create a .env file in backend root directory including these fields
```shell
DATABASE_URL= <your database connection string>
JWT_ACCESS_TOKEN_SECRET_KEY= <your access token secret key>
JWT_REFRESH_TOKEN_SECRET_KEY= <your refresh token secret key>
TEMP_TOKEN_SECRET_KEY= <your temporary token secret key>
MAILER_HOST= <your mailer host>
MAILER_PORT= <your mailer port>
MAILER_EMAIL= <your mailer email address>
MAILER_NAME= <your mailer name>
MAILER_APP_PASSWORD= <your mailer application password>
```

### 4. Create the database collection
Create your database collections (e.g User and ActivityLog), reference from the schema.prisma in ./src/prisma
<br>
Run
```shell
yarn prisma generate --schema ./src/prisma/schema.prisma   
```

### 5. Run the backend app
```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```
Please visit [localhost:8080]/swagger for full API documentation.

### 6. Playing with UI screens demo
In frontend (fe) directory
<br>
Update the connection string in ./src/apis/base.js
```bash
  baseURL: "http://localhost:8080", // your backend server
```

Install and run the frontend application
```shell
npm install
```
```shell
npm run dev
```

