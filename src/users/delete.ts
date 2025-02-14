import {Response} from "express";
import { AuthenticatedRequest } from "../authentication";
import { isAlphanumeric } from "validator";
import User from "../schemas/user";
import DeletedUser from "../schemas/deleted_user";
import {checkUsername} from "../auth/signUp";
import { STATUS_CODES } from "http";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user)
		return;

	if(req.user.role !== "admin") {
		res.status(401).json({status: STATUS_CODES[401]});
		return;
	}

	if(!checkUsername(req.params.username)) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid Username"});
		return;
	}

	try {
		const user = await User.findOneAndDelete({ username: req.params.username, role: ["viewer", "commenter", "editor"] });

		if (user && user.username && user.role !== "admin") {
			const toDelete = new DeletedUser({username: user.username, dateDeleted: Date.now()});
			await toDelete.save();
		}

		res.status(200).json({ status: STATUS_CODES[200], message: "User deleted successfully (if they existed and weren't another admin)" });
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};