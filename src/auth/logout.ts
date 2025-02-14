import {Request, Response} from "express";
import {blacklist} from "../authentication";
import { STATUS_CODES } from "http";

export default (req: Request, res: Response) => {
	let token = req.get("Authorization");

	if(!token)
		return;

	blacklist.add(token.split(" ")[1]);
	res.status(200).json({status: STATUS_CODES[200], message: "Logged out successfully"});
}