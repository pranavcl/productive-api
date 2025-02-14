import {Request, Response} from "express";
import {checkUsername, checkPassword} from "./signUp";
import User from "../schemas/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { STATUS_CODES } from "http";

export default async (req: Request, res: Response) => {
	if(!req.body.username || !req.body.password) {
		res.status(400).json({status: STATUS_CODES[400], message: "Missing required fields"});
		return;
	}

	if(!checkUsername(req.body.username) || !checkPassword(req.body.password)) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid username/password"});
		return;
	}
		
	try {
		const user = await User.findOne({username: req.body.username});

		if(user && user.password && (await bcrypt.compare(req.body.password, user.password))) {
			const secretKey = process.env.KEY;

			if(!secretKey)
				throw new Error("JWT Secret is not defined in .env");

			user.lastLoggedIn = new Date();
			const result = await user.save();

			const token = jwt.sign({ username: user.username, role: user.role }, secretKey, {
				expiresIn: '1h',
			});
			res.status(200).json({ status: STATUS_CODES[200], token  });

			return;
		}

		res.status(400).json({status: STATUS_CODES[400], message: "Incorrect username/password"});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};
