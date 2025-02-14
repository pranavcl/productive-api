import { Response } from "express";
import { AuthenticatedRequest } from "../authentication";
import Task from "../schemas/task";
import { checkUsername } from "../auth/signUp";
import parser from "any-date-parser";
import { STATUS_CODES } from "http";

export default async (req: AuthenticatedRequest, res: Response) => {
	// Authorization check
	if(!req.user || !(["editor", "admin"].includes(req.user.role))) {
		res.status(401).json({status: STATUS_CODES[401], message: "Only editors and admins can create tasks"});
		return;
	}

	// Default values
	let priority = 3;
	let tagsQuery = req.query.tags as string;

	if(tagsQuery && tagsQuery.length > 256) {
		res.status(400).json({status: STATUS_CODES[400], message: "Too many tags!"});
		return;
	}

	let tags: string[] = (tagsQuery) ? tagsQuery.split(" ").filter(tag => tag.length > 1) : [];
	let deadline: Date | undefined;

	// Query check
	if(!req.query.name || Number(req.query.name.length) < 1 || Number(req.query.name.length) > 128) {
		res.status(400).json({status: STATUS_CODES[400], message: "Task must have a valid name"});
		return;
	}

	if(req.query.assignedTo && !checkUsername(req.query.assignedTo as string)) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid query value for `assignedTo`"});
		return;
	}

	if(req.query.priority) {
		let priorityQuery = req.query.priority as string;

		if(Number(priorityQuery) < 1 || Number(priorityQuery) > 5) {
			res.status(400).json({status: STATUS_CODES[400], message: "Invalid query value for `priority`"});
			return;
		}

		priority = Math.floor(Number(priorityQuery));
	}

	if(req.query.deadline) {
		let parseAttempt: any = parser.fromString(req.query.deadline as string);

		if(parseAttempt.invalid) {
			res.status(400).json({status: STATUS_CODES[400],  message: "Invalid deadline"});
			return;
		}

		else deadline = new Date(parseAttempt);
	}

	try {
		let docs: number = await Task.countDocuments({});

		await Task.create({
			name: req.query.name as string,
			assignedTo: req.query.assignedTo as string,
			priority,
			tags,
			createdBy: req.user.username as string,
			comments: [],
			...(deadline ? { deadline } : {})
		});

		res.status(201).json({status: STATUS_CODES[201]});
	} catch(err) {
		console.log(err)
		res.status(500).json({status: STATUS_CODES[500]});
	}
}
