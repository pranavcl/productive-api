import { AuthenticatedRequest } from "../authentication";
import { Response } from "express";
import { checkEmail, checkPassword } from "./signUp";
import { STATUS_CODES } from "http";
import User from "../schemas/user";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export default async (req: AuthenticatedRequest, res: Response) => {
	let hashedToken = req.query.token as string;
	let email = req.query.email as string;
	let password = req.body.password as string;

	if(!hashedToken) {
		res.status(400).json({status: STATUS_CODES[400], message: "Reset token is not valid"});
		return;
	}

	if(!checkPassword(password)) {
		res.status(400).json({status: STATUS_CODES[400], message: "New password is not valid"});
		return;
	}

	if(!email || !checkEmail(email)) {
		res.status(400).json({status: STATUS_CODES[400], message: "E-mail address is not valid"});
		return;
	}

	try {
		let data = await User.findOne({resetPasswordToken: hashedToken});

		if(!data || !data.resetPasswordExpires || !data.resetPasswordToken) {
			res.status(400).json({status: STATUS_CODES[400], message: "Reset token is not valid"});
			return;
		}

		if(Date.now()  > data.resetPasswordExpires) {
			res.status(401).json({status: STATUS_CODES[401], message: "Reset token expired"});
			return;
		}

		const tokenBuffer = Buffer.from(hashedToken);
		const storedTokenBuffer = Buffer.from(data.resetPasswordToken);

		if (!crypto.timingSafeEqual(tokenBuffer, storedTokenBuffer)) {
			res.status(400).json({ status: STATUS_CODES[400], message: "Invalid token" });
			return;
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		data.password = hashedPassword;
		data.resetPasswordExpires = undefined;
		data.resetPasswordToken = undefined;
		await data.save();

		res.status(200).json({status: STATUS_CODES[200], message: "Your password has been reset"});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};
