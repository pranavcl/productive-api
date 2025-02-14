import {Response} from "express";
import {AuthenticatedRequest} from "../authentication";
import User from "../schemas/user";
import {checkUsername} from "../auth/signUp";
import { STATUS_CODES } from "http";

export default async(req: AuthenticatedRequest, res: Response) => {
	if(!req.user || !checkUsername(req.params.username)) {
		res.status(400).json({"status": STATUS_CODES[400], message: "Invalid username"});
		return;
	}

	const username = req.params.username;

	try {
		let data = await User.findOne({username}).select("-_id -__v -updatedAt -password" + ((req.user.role !== "admin") ? " -email" : ""));

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "User not found"});
			return;
		}

		res.status(200).json(data);
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};