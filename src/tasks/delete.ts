import { Response } from "express";
import { AuthenticatedRequest } from "../authentication";
import { STATUS_CODES } from "http";
import Task from "../schemas/task";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user || req.user.role !== "admin") {
		res.status(401).json({status: STATUS_CODES[401], message: "Only admins can permanently delete tasks. Did you mean to use /tasks/:id/soft-delete?"});
		return;
	}

	try {
		const data = await Task.findOneAndDelete({id: req.params.id});

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "Task not found"});
			return;
		}

		res.status(200).json({status: STATUS_CODES[200], message: "Task permanently deleted"});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
}