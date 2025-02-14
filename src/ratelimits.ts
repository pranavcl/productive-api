import { rateLimit } from "express-rate-limit";

const loginLimiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	max: 5,
	message: { message: "Too many login attempts, try again later." },
});

const signUpLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 1000, // 1 day
	max: 10,
	message: { message: "Too many sign-up attempts, try again later." },
});

const resetPasswordLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 3,
	message: { message: "Too many reset requests, try again later." },
});

const forgotPasswordLimiter = resetPasswordLimiter;

const meLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: { message: "Too many reset requests, try again later." },
});

const getUserByUsernameLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 60,
	message: { message: "Too many reset requests, try again later." },
});

const getTasksLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: { message: "Too many reset requests, try again later." },
});

const getTaskByIdLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: { message: "Too many reset requests, try again later." },
});

const createTaskLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10,
	message: { message: "Too many reset requests, try again later." },
});

const updateTaskLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 30,
	message: { message: "Too many reset requests, try again later." },
});

const deleteTaskLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10,
	message: { message: "Too many reset requests, try again later." },
});

const addCommentLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 20,
	message: { message: "Too many reset requests, try again later." },
});

export default {loginLimiter, signUpLimiter, resetPasswordLimiter, forgotPasswordLimiter, meLimiter, getUserByUsernameLimiter, getTasksLimiter, getTaskByIdLimiter, createTaskLimiter, updateTaskLimiter, deleteTaskLimiter, addCommentLimiter};
