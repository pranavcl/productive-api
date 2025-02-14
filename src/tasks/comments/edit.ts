import { Response } from "express";
import { AuthenticatedRequest } from "../../authentication";
import { STATUS_CODES } from "http";
import Task from "../../schemas/task";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user || req.user.role === "viewer") {
		res.status(401).json({status: STATUS_CODES[401], message: "You must atleast have `commenter` role to edit comments"});
		return;
	}

	let id = req.params.id;
	let commentID = req.params.commentID;
	let comment = req.body.comment as string;

	if(!comment || comment.length < 1 || comment.length > 512) {
		res.status(400).json({status: STATUS_CODES[400], message: "Comment is too short or too long!"});
		return;
	}

	try {
		let data = await Task.findOne({id: id});

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "Task not found"});
			return;
		}

		for(let i = 0; i < data.comments.length; i++) {
			if(data.comments[i]._id.toString() === commentID) {
				if(data.comments[i].by != req.user.username) {
					res.status(401).json({status: STATUS_CODES[401], message: "That's not your comment!"});
					return;
				} else {
					data.comments[i].comment = comment;
					break;
				}
			}
		}

		await data.save();

		res.status(200).json({status: STATUS_CODES[200], message: "Comment edited successfully"});
	} catch(err) {
		console.error(err);
		res.status(500).json(STATUS_CODES[500]);
	}
};