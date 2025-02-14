import {Response} from "express";
import {AuthenticatedRequest} from "../authentication";
import { STATUS_CODES } from "http";

export default (req: AuthenticatedRequest, res: Response) => {
	if(!req.user)
		return;

	res.status(200).json({status: STATUS_CODES[200], user: {username: req.user.username, role: req.user.role}});
};