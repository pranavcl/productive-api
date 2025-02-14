import { Response } from "express";
import { AuthenticatedRequest } from "../authentication";
import { STATUS_CODES } from "http";
import { checkUsername } from "../auth/signUp";
import parser from "any-date-parser";
import Task from "../schemas/task";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user || !["editor", "admin"].includes(req.user.role)) {
		res.status(401).json({status: STATUS_CODES[401], message: "Only editors and admins can update tasks"});
		return;
	}

	let id = req.params.id;

	let query: any = {};
	query.name = req.query.name as string;
	query.deadline = req.query.deadline as string;
	query.priority = req.query.priority as string;
	query.finished  = req.query.finished as string;
	query.assignedTo = req.query.assignedTo as string;
	query.tags = req.query.tags as string;

	let deadline: Date | undefined = undefined;
	let tags: string[] = (query.tags) ? query.tags.split(" ").filter((tag: string) => tag.length > 1) : [];

	if(query.name && (Number(query.name.length) < 1 || Number(query.name.length) > 128)) {
		res.status(400).json({status: STATUS_CODES[400], message: "Task must have a valid name"});
		return;
	}

	if(query.assignedTo && !checkUsername(query.assignedTo)) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid query value for `assignedTo`"});
		return;
	}

	if(query.deadline) {
		let parseAttempt: any = parser.fromString(req.query.deadline as string);

		if(parseAttempt.invalid) {
			res.status(400).json({status: STATUS_CODES[400],  message: "Invalid deadline"});
			return;
		}

		else deadline = new Date(parseAttempt);
	}

	if(query.priority && Number(query.priority) > 5 || Number(query.priority) < 1) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid query value for `priority`"});
		return;
	}

	if(query.finished && !["1", "0"].includes(query.finished)) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid query value for `finished`"});
		return;
	}

	let priority = Math.floor(Number(query.priority));
 
	try {
		let data = await Task.findOneAndUpdate({id: id, isDeleted: false}, {
			...(query.name ? { name: query.name } : {}),
			...(query.deadline ? { deadline: deadline } : {}),
			...(query.priority ? { priority: query.priority } : {}),
			...(query.finished ? { finished: (query.finished === "1" ? true : false) } : {}),
			...(query.assignedTo ? { assignedTo: query.assignedTo } : {}),
			...(query.tags ? { tags: tags } : {}),
			lastEditedBy: req.user.username as string
		});

		if(!data) {
			res.status(404).json({status: STATUS_CODES[404], message: "Task does not exist."});
			return;
		}

		res.status(200).json({status: STATUS_CODES[200], message: "Task updated successfully."});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
}