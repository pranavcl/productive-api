import {Response} from "express";
import {AuthenticatedRequest} from "../authentication";
import User from "../schemas/user";
import { STATUS_CODES } from "http";

export default async (req: AuthenticatedRequest, res: Response) => {
	if(!req.user) return;

    try {
        let page = Math.max(1, parseInt(req.query.page as string) || 1);
        let limit = Math.max(1, parseInt(req.query.limit as string) || 20);

        const skip = (page - 1) * limit

        const users = await User.find({}).select("-_id -__v -createdAt -updatedAt -lastLoggedIn -password -email").skip(skip).limit(limit);

        res.status(200).json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({status: STATUS_CODES[500]});
    }
};