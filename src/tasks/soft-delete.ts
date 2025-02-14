import { Response } from "express";
import { AuthenticatedRequest } from "../authentication";
import { STATUS_CODES } from "http";
import Task from "../schemas/task";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user || !["editor", "admin"].includes(req.user.role)) {
		res.status(401).json({status: STATUS_CODES[401], message: "Only editors and admins can soft delete tasks"});
		return;
	}

	try {
		const data = await Task.findOneAndUpdate({id: req.params.id, isDeleted: false}, {isDeleted: true});

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "Task not found"});
			return;
		}

		res.status(200).json({status: STATUS_CODES[200], message: "Task deleted"});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
}