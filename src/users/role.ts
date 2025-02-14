import {Response} from "express";
import { AuthenticatedRequest } from "../authentication";
import User from "../schemas/user";
import {checkUsername} from "../auth/signUp";
import { STATUS_CODES } from "http";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user || req.user.role !== "admin") {
		res.status(401).json({status: STATUS_CODES[401]});
		return;
	}

	if(!checkUsername(req.params.username) || !(["viewer","commenter","editor","admin"].includes(req.query.role as string))) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid Username/Query"});
		return;
	}

	try {
		let user = await User.findOne({ username: req.params.username });

		if(!user || user.role === "admin") {
			res.status(400).json({status: STATUS_CODES[400], message: "User does not exist or is an admin"});
			return;
		}

		user.role = req.query.role as string;
		await user.save();

		res.status(200).json({status: STATUS_CODES[200], message: "Permissions changed"});

	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};