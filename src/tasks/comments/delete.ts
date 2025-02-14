import { Response } from "express";
import { AuthenticatedRequest } from "../../authentication";
import { STATUS_CODES } from "http";
import Task from "../../schemas/task";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user || req.user.role === "viewer") {
		res.status(401).json({status: STATUS_CODES[401], message: "You must atleast have `commenter` role to delete comments"});
		return;
	}

	let id = req.params.id;
	let commentID = req.params.commentID;

	try {
		let data = await Task.findOne({id: id});

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "Task not found"});
			return;
		}

		for(let i = 0; i < data.comments.length; i++) {
			if(data.comments[i].id === commentID) {
				if((data.comments[i].by === req.user.username || ["editor", "admin"].includes(req.user.role))) {
					data.comments.splice(i, 1);
					break;
				} else {
					res.status(401).json({status: STATUS_CODES[401]});
					return;
				}
			}
		}
		
		await data.save();

		res.status(200).json({status: STATUS_CODES[200], message: "Comment removed (if it existed)"});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};