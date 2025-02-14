import { Request, Response } from "express";
import { checkEmail } from "./signUp";
import { STATUS_CODES } from "http";
import User from "../schemas/user";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

export default async (req: Request, res: Response) => {
	if(!process.env.EMAILHOST || !process.env.SSLPORT || !process.env.EMAILUSER || !process.env.EMAILPASS) {
		res.status(500).json({status: STATUS_CODES[500], message: "E-mail environment variables are not properly set, please contact your server administrator"});
		return;
	}

	let transporter = nodemailer.createTransport({
		host: process.env.EMAILHOST,
		port: parseInt(process.env.SSLPORT),
		secure: true,
		auth: {
			user: process.env.EMAILUSER,
			pass: process.env.EMAILPASS
		},
		tls: {
			rejectUnauthorized: false
		}
	} as nodemailer.TransportOptions);

	let email = req.body.email as string;

	if(!email || !checkEmail(email)) {
		res.status(400).json({status: STATUS_CODES[400], message: "Please enter the registered e-mail address"});
		return;
	}
	
	try {
		const user = await User.findOne({email: email});

		if (!user) {
			res.status(200).json({ status: STATUS_CODES[200], message: "If your email is registered, a password reset link has been sent" });
			return;
		}

		const resetToken = crypto.randomBytes(32).toString("hex");

		const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

		user.resetPasswordToken = hashedToken;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
		await user.save();

		let mailOptions = {
			from: process.env.EMAILUSER,
			to: email,
			subject: "Reset Your Password",
			text: `You requested a password reset. Click the link below to reset your password:\n\n` +
				`${process.env.BASE_URL}/auth/reset-password?token=${resetToken}&email=${email}\n\n` +
				`If you did not request this, please ignore this email.`
		};

		await transporter.sendMail(mailOptions);

		res.status(200).json({status: STATUS_CODES[200], message: "If your email is registered, a password reset link has been sent"});
	} catch(err) {
		console.error(err);
		res.status(500).json({status: STATUS_CODES[500]});
	}
};