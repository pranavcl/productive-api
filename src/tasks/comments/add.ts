import { Response } from "express";
import { AuthenticatedRequest } from "../../authentication";
import { STATUS_CODES } from "http";
import Task from "../../schemas/task";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user || req.user.role === "viewer") {
		res.status(401).json({status: STATUS_CODES[401], message: "You must atleast have `commenter` role to leave comments"});
		return
	}

	let id = req.params.id;

	let comment = req.body.comment as string;

	if(!comment || comment.length < 1 || comment.length > 512) {
		res.status(400).json({status: STATUS_CODES[400], message: "Comment is too long!"});
		return;
	}

	try {
		let data = await Task.findOneAndUpdate({id: id}, {$push: {comments: {dateCreated: Date.now(), by: req.user.username as string, comment: comment}}});

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "Task does not exist"});
			return;
		}

		res.status(200).json({status: STATUS_CODES[200], message: "Comment added successfully"});

	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};