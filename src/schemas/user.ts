import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		require: true
	},
	password: {
		type: String,
		require: true
	},
	email: {
		type: String,
		require: true
	},
	role: {
		type: String,
		require: true
	},
	lastLoggedIn: {
		type: Date,
		required: true
	},
	resetPasswordToken: {
		type: String
	},
	resetPasswordExpires: {
		type: Number
	}
}, {timestamps: true});

export default mongoose.model("User", userSchema, "users");