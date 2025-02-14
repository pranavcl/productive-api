import { Response } from "express";
import { AuthenticatedRequest } from "../authentication";
import { STATUS_CODES } from "http";
import Task from "../schemas/task";
import user from "../schemas/user";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user)
		return;

	let id = req.params.id;

	try {
		let query: {id: string, isDeleted: Boolean | undefined} = {id: id, isDeleted: false};

		if(req.user.role === "admin")
			delete query.isDeleted;

		let selectQuery = "-_id -__v" + ((req.user.role === "admin") ? "" : "-isDeleted");

		let data = await Task.findOne(query).select(selectQuery);

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "Task does not exist"});
			return;
		}

		res.status(200).json(data);
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};