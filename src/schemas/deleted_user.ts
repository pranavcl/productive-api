import mongoose from "mongoose";

const deletedUserSchema = new mongoose.Schema({
	username: {
		type: String,
		require: true
	},
	dateDeleted: {
		type: Date,
		require: true
	}
});

export default mongoose.model("Deleted User", deletedUserSchema, "deleted_users");