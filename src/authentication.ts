import { NextFunction, Request, Response } from "express";
import jwt, { TokenExpiredError } from "jsonwebtoken";
import DeletedUser from "./schemas/deleted_user";
import { STATUS_CODES } from "http";

const protectedRoutes = ["/auth/logout", "/auth/me", "/users", "/tasks"];
export let blacklist = new Set<string>();

export interface AuthenticatedRequest extends Request {
	user?: jwt.JwtPayload;
};

export default async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
	if (!protectedRoutes.some(route => req.originalUrl.startsWith(route))) return next();

	try {
		let token = req.get("Authorization");
		if(!token || token.split(" ").length != 2 || !token.startsWith("Bearer ")) {
			res.status(400).json({status: STATUS_CODES[400], message: "Invalid token"});
			return;
		}

		token = token.split(" ")[1];

		if(blacklist.has(token)) {
			res.status(400).json({status: STATUS_CODES[400], message: "Blacklisted token"});
			return;
		}

		const secretKey = process.env.KEY;
		if(!secretKey)
			throw new Error("JWT Secret is not defined in .env");

		const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;

		if (!decoded.username || !decoded.role) throw new Error("Invalid token");
		
		let data = await DeletedUser.findOne({username: decoded.username});

		if(data) {
			res.status(400).json({status: STATUS_CODES[400], message: "User deleted"});
			return;
		}

		req.user = decoded;

		next();
	} catch(err: any) {
		if(!(err instanceof TokenExpiredError))
			console.error(err);
		res.status(401).json({status: STATUS_CODES[401], message: "Invalid token"});
	}
};