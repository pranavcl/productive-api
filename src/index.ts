import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize";

import dbConnect from "./dbConnect";
import authentication from "./authentication";
import auth from "./auth/auth";
import users from "./users/users";
import tasks from "./tasks/tasks";
import { STATUS_CODES } from "http";
import ratelimits from "./ratelimits";

const { xss } = require("express-xss-sanitizer");

dotenv.config(); // Load environment variables
dbConnect(); // Connect to MongoDB

const app = express();
const port: string = process.env.PORT ?? "8080";

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(xss());
app.use(mongoSanitize());
app.use(cors()); // Allowing cross-origin requests for a (potential) future frontend

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
	if(err instanceof SyntaxError && "body" in err) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid JSON format"});
		return;
	}
	next();
});

app.use(authentication); // Authentication Middleware

// Endpoints

// Root
app.get("/", (req: express.Request, res: express.Response) => {
	res.status(200).json({
		status: STATUS_CODES[200],
		name: "Productive API",
		version: "1.0.0"
	});
});

// auth endpoints
app.post("/auth/signup", ratelimits.signUpLimiter, auth.signUp);
app.post("/auth/login", ratelimits.loginLimiter, auth.login);
app.post("/auth/forgot-password", ratelimits.forgotPasswordLimiter, auth.forgotpassword);
app.put("/auth/reset-password", ratelimits.resetPasswordLimiter, auth.resetpassword);
app.get("/auth/me", ratelimits.meLimiter, auth.me);
app.post("/auth/logout", auth.logout);

// users endpoints
app.get("/users", users.root);
app.get("/users/:username", ratelimits.getUserByUsernameLimiter, users.name);
app.put("/users/update", users.update);
app.delete("/users/:username/delete", users.deleteUser);
app.put("/users/:username/role", users.role);

// tasks endpoints
app.get("/tasks", ratelimits.getTasksLimiter, tasks.root);
app.get("/tasks/:id", ratelimits.getTaskByIdLimiter, tasks.id);
app.post("/tasks/create", ratelimits.createTaskLimiter, tasks.create);
app.put("/tasks/:id/update", ratelimits.updateTaskLimiter, tasks.update);
app.delete("/tasks/:id/soft-delete", tasks.softDelete);
app.delete("/tasks/:id/delete",ratelimits.deleteTaskLimiter, tasks.hardDelete);
app.put("/tasks/:id/restore", tasks.restore);

//  comments endpoints
app.post("/tasks/:id/comments/add", ratelimits.addCommentLimiter, tasks.comments.add);
app.put("/tasks/:id/comments/edit/:commentID", tasks.comments.edit);
app.delete("/tasks/:id/comments/delete/:commentID", tasks.comments.deleteComment);

// Non-existent routes/incorrect call method

app.use((req, res, next) => {
	res.status(404).json({status: STATUS_CODES[404], message: `Cannot ${req.method} ${req.originalUrl}`});
});

// Listen at port

app.listen(port, () => {
	console.log(`✅ Server running on https://localhost:${port}`);
});
