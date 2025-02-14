import { AuthenticatedRequest } from "../authentication";
import { Response } from "express";
import { checkUsername } from "../auth/signUp";
import Task from "../schemas/task";
import { STATUS_CODES } from "http";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user)
		return;

	// Default pagination

	const page = Math.max(1, parseInt(req.query.page as string) || 1);
	const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
	const skip = (page - 1)*limit;

	// Query parameters
	const assignedTo = req.query.assignedTo as string;
	const createdBy = req.query.createdBy as string;
	const finishedQuery = req.query.finished as string;
	const sortByQuery = req.query.sortBy as string;
	const reverseSortQuery = req.query.reverseSort as string;
	const tagsQuery = req.query.tags as string;
	const isDeletedQuery = req.query.isDeleted as string || "0";

	if(isDeletedQuery && isDeletedQuery !== "0") {
		if(!(req.user.role === "admin")) {
			res.status(401).json({status: STATUS_CODES[401], message: "You must be an admin to see soft-deleted tasks"});
			return;
		}

		if(!["1", "0"].includes(isDeletedQuery)) {
			res.status(400).json({status: STATUS_CODES[401], message: "Invalid query value for `isDeleted`"});
			return;
		}
	}

	if((assignedTo && !checkUsername(assignedTo)) || (createdBy && !checkUsername(createdBy))) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid username in query"});
		return;
	}

	if(finishedQuery && !(["1", "0"].includes(finishedQuery))) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid query value for `finished`"});
		return;
	}

	if(sortByQuery && !(["deadline", "priority", "dateCreated"].includes(sortByQuery))) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid parameter to sort by"});
		return;
	}

	if(reverseSortQuery && !(["1", "0"].includes(reverseSortQuery))) {
		res.status(400).json({status: STATUS_CODES[400], message: "Invalid query value for `reverseSort`"});
		return;
	}

	// Extracting tags
	const tags: string[] = tagsQuery ? tagsQuery.split(" ").filter(tag => tag.length > 1) : [];
	if (tags.length > 256) {
		res.status(400).json({ status: STATUS_CODES[400], message: "Too many tags!" });
		return;
	}

	const filters: any = {isDeleted: false};

	if(assignedTo) filters.assignedTo = assignedTo;
	if(createdBy) filters.createdBy = createdBy;
	if(finishedQuery) filters.finished = (finishedQuery === "1");
	if(tags.length) filters.tags = {$in: tags };
	if(req.user.role === "admin") filters.isDeleted = (isDeletedQuery === "1");

	try {
		let data = await Task.find(filters)
			.select("-_id -__v -isDeleted -comments")
			.sort({[sortByQuery || "dateCreated"]: reverseSortQuery === "1" ? "desc" : "asc"})
			.skip(skip)
			.limit(limit);

		if(data) {
			res.status(200).json(data);
			return;
		}

		res.status(200).json({});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
}
