import {Response} from "express";
import {AuthenticatedRequest} from "../authentication";
import User from "../schemas/user";
import bcrypt from "bcryptjs";
import {blacklist} from "../authentication";
import {checkUsername, checkPassword, checkEmail} from "../auth/signUp";
import { STATUS_CODES } from "http";

export default async(req: AuthenticatedRequest, res: Response) => {
	if(!req.user)
		return;

	try {
		let update: { username?: string, password?: string, email?: string } = {
			username: undefined,
			password: undefined,
			email: undefined
		};

		if(req.body.username) {
			if(!checkUsername(req.body.username)) {
				res.status(400).json({status: STATUS_CODES[400], message: "Invalid Username"});
				return;
			}

			update.username = req.body.username;
		}

		if(req.body.email) {
			if(!checkEmail(req.body.email)) {
				res.status(400).json({status: STATUS_CODES[400], message: "Invalid Email"});
				return;
			}

			update.email = req.body.email;
		}

		if(req.body.password) {
			if(!checkPassword(req.body.password)) {
				res.status(400).json({status: STATUS_CODES[400], message: "Password too long"});
				return;
			}

			const salt = await bcrypt.genSalt(10);
			const hash = await bcrypt.hash(req.body.password, salt);
			
			update.password = hash;
		}

		await User.updateOne({username: req.user.username}, update);

		res.status(200).json({status: STATUS_CODES[200], message: "Please login again"})
		
		let token = req.get("Authorization")?.split(" ")[1];

		if(token)
			blacklist.add(token);
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};