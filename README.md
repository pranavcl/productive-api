# ⚒️ Productive API

📌 **Productive API** is a **powerful and secure backend solution** for managing team tasks, collaboration, and productivity. It offers **seamless user roles, real-time task management, and secure authentication** — all built with industry-best practices. ❤️

## 🌠 Features

- 🕸️ 22 API Endpoints
- 🤝 RESTful Architecture
- 👷 Well-structured **Role-Based Access Control (RBAC)** for 4 levels of privilege - **Viewer, Commenter, Editor and Admin**
- 🔍 Advanced filters (`finished`, `createdBy`, `assignedTo`, `sortBy`, `priority`, `deadline`, etc.) to prevent over-fetching
- 🏷️ Segregate tasks into **tags (similar to boards)** for subteams
- 💬 **Commenting system** to start conversations under tasks
- ⛔ **JWT Authentication** for Protected Routes
- 🔒 Secure **hashing + salting** of passwords using [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- 🚦 Sensible **rate limits** on critical endpoints to prevent abuse
- 🔁 Security-enhancing middleware like [cors](https://www.npmjs.com/package/cors), [xss](https://www.npmjs.com/package/xss) and [express-mongo-sanitize](https://www.npmjs.com/package/express-mongo-sanitize)
- ⚙️ Modular and easy to configure source code for every endpoint
- 🌱 Easy to **self-host** in just a **few steps** (described below)

## 🪣 Dependencies

1. Install [NodeJS](https://nodejs.org/en/download) on your system

2. Install [MongoDB](https://www.mongodb.com/try/download/community) on your system

3. You can use any tool of your choice, such as [Postman](https://www.postman.com/downloads/) to interact with the API.

## 🧱 Building from Source

1. First, clone the repository:

```bash
git clone https://github.com/pranavcl/productive-api
```

2. Enter the cloned repository and run `npm install`:

```bash
cd productive-api
npm install
```

3. Make sure `npx` is installed:

```bash
npm install --global npx
```

4. Create a `.env` file in the **root directory (./productive-api)** and define the values of **`KEY` (mandatory)** and **`BASE_URL`, `PORT` and `DB` (optional)** like so:

```
KEY=your-secret-key

BASE_URL=http://localhost:2000/
PORT=2000
DB=mongodb://localhost:27017/productive
```

5. **(Optional)** Additionally, If you want the **/auth/forgot-password** and **/auth/reset-password** endpoints to work, you must also define the environment variables **`EMAILHOST`, `SSLPORT`, `EMAILUSER` and `EMAILPASS`** in your `.env` file like so:

```
EMAILHOST=smtp.yourdomain.com
SSLPORT=465 (or whatever the SSL port is on your mailserver)
EMAILUSER=example@yourdomain.com
EMAILPASS=(your email account's password)
```

6. Finally, run the API using `nodemon`:

```
npx nodemon
```

**All done!** 🎉

## 🗺️ Summary of Endpoints

### 🚨 <ins>Note:</ins> 

- An **exclamation mark (!)** denotes a **required** field.
- The hierarchy of privilege is **Viewer -> Commenter -> Editor -> Admin**.
- **Commenter+** means any role that is **Commenter or above (Editor, Admin)** can hit the endpoint successfully. Similarly, **Editor+** means any role that is **Editor or above (Admin)** can hit the endpoint successfully.
- **(None)** means that the endpoint can be hit without a role (without logging in).
- The JWT should be included in the **`Authorization` header** of the HTTP request as follows:
```makefile
Authorization: Bearer <your-jwt-token>
```
*(Make sure there is a space between "`Bearer`" and the token.)*

### ```/```

| Endpoint | Purpose | Query | Body | JWT? | Role
| - | - | - | - | - | -
| `GET /` | Prints version information | (None) | (None) | No | (None)

### ```/auth/```

| Endpoint | Purpose | Query | Body | JWT? | Role
| - | - | - | - | - | -
| `POST /auth/signup` | Register a new account | (None) | `username`!, `password`!, `email`! | No | (None)
| `POST /auth/login` | Login into an account | (None) | `username`!, `password`! | No | (None)
| `POST /auth/forgot-password` | Initiate password reset | (None) | `email`! | No | (None)
| `PUT /auth/reset-password` | Reset password | `email`!, `token`!  | `password`! | No | (None)
| `GET /auth/me` | Display account details | (None) | (None) | **Yes** | **Viewer+**
| `POST /auth/logout` | Log out | (None) | (None) | **Yes** | **Viewer+**

### 🚨 <ins>Note:</ins> ALL the following endpoints require a valid JWT. 👇

### ```/users/```

| Endpoint | Purpose | Query | Body | Role
| - | - | - | - | - 
| `GET /users` | Get a list of registered users | `page`, `limit` | (None) | **Viewer+**
| `GET /users/:username` | Get the details of a specific user (by username) | (None) | (None) | **Viewer+**
| `PUT /users/update` | Update your account | (None) | `username`, `password`, `email` | **Viewer+**
| `DELETE /users/:username/delete` | Delete an account | (None) | (None) | **Admin**
| `PUT /users/:username/role` | Change the role of an account | (None) | (None) | **Admin**

### ```/tasks/```

| Endpoint | Purpose | Query | Body | Role
| - | - | - | - | - 
| `GET /tasks` | Get a list of tasks | `page`, `limit`, `assignedTo`, `createdBy`, `finished`, `sortBy`, `reverseSort`, `tags`, `isDeleted` | (None) | **Viewer+**
| `GET /tasks/:id` | View a specific task (by ID) **and comments on it** | (None) | (None) | **Viewer+**
| `POST /tasks/create` | Create a new task | `name`, `tags`, `assignedTo`, `priority`, `deadline` | (None) | **Editor+**
| `PUT /tasks/:id/update` | Update a task | `finished`, `name`, `tags`, `assignedTo`, `priority`, `deadline` | (None) | **Editor+**
| `DELETE /tasks/:id/soft-delete` | Soft-delete a task | (None) | (None) | **Editor+**
| `DELETE /tasks/:id/delete` | Hard-delete a task | (None) | (None) | **Admin**
| `PUT /tasks/:id/restore` | Restore a soft-deleted task | (None) | (None) | **Admin**

### ```/tasks/comments/```

| Endpoint | Purpose | Query | Body | Role
| - | - | - | - | - 
| `POST /tasks/:id/comments/add` | Add a comment to a task | (None) | `comment` | **Commenter+**
| `PUT /tasks/:id/comments/edit/:commentID` | Edit your own comment | (None) | `comment` | **Commenter+**
| `DELETE /tasks/:id/comments/delete/:commentID` | Delete comments (Commenters can only delete their own comments, while **Editor+** can delete the comments of others too) | (None) | (None) | **Commenter+**

## License

Published under the [Productive API license](https://github.com/pranavcl/productive-api/blob/main/LICENSE.md)
