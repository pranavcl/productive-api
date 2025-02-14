import {Request, Response} from "express";
import {isEmail, isAlphanumeric} from "validator";
import bcrypt from "bcryptjs";
import User from "../schemas/user";
import DeletedUser from "../schemas/deleted_user";
import { STATUS_CODES } from "http";

export default async (req: Request, res: Response) => {
	if(!req.body.username || !req.body.password || !req.body.email) {
		res.status(400).json({status: STATUS_CODES[400], message: "Missing required fields"});
		return;
	}

	try {
		const salt = await bcrypt.genSalt(10);

		let username: string = req.body.username;
		let password: string = await bcrypt.hash(req.body.password, salt);
		let email: string = req.body.email;

		checkValidity(username, password, email, res);

		await checkUniqueness(username, password, email, res);
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};

export const checkUsername = (username: string) => {
	return username.match(/^[a-zA-Z0-9_.]{3,32}$/);
};

export const checkEmail = (email: string) => {
	return !(email.length > 128 || !isEmail(email));
};

export const checkPassword = (password: string) => {
	return (password.length < 128 && password.length > 0);
};

const checkValidity = (username: string, password: string, email: string, res: Response) => {
	if(!(checkUsername(username) && checkEmail(email) && checkPassword(password)))
		return res.status(400).json({status: STATUS_CODES[400], message: "Please enter a valid username, password and email address"});
};

const checkUniqueness = async (username: string, password: string, email: string, res: Response) => {
	try {
		let existingUser = await User.findOne({username: username});

		if(!existingUser)
			existingUser = await DeletedUser.findOne({username: username});

		let existingEmail = await User.findOne({email: email});

		if(existingUser || existingEmail)
			return res.status(400).json({status: STATUS_CODES[400], message: "Username or email address is already registered"});

		await createAccount(username, password, email, res);
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};

const createAccount = async (username: string, password: string, email: string, res: Response) => {
	try {
		const user = new User({username,password,email,role: "viewer",lastLoggedIn: Date.now()});

		await user.save();

		res.status(201).json({status: STATUS_CODES[201]});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};