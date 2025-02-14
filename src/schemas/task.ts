import mongoose from "mongoose";

const AutoIncrement = require("mongoose-sequence")(mongoose);

const taskSchema = new mongoose.Schema({
	id: {
		type: Number,
		required: false
	},
	name: {
		type: String,
		required: true
	},
	deadline: {
		type: Date,
		required: false
	},
	priority: {
		type: Number,
		enum: [1, 2, 3, 4, 5],
		default: 3
	},
	finished: {
		type: Boolean,
		default: false,
		required: true
	},
	assignedTo: {
		type: String,
		required: false
	},
	isDeleted: {
		type: Boolean,
		default: false,
		required: true
	},
	tags: {
		type: [String],
		default: [],
		required: true
	},
	createdBy: {
		type: String,
		required: true
	},
	lastEditedBy: {
		type: String,
		required: false
	},
	comments: {
		type: [{
			dateCreated: Date,
			by: String,
			comment: String
		}],
		default: [],
		required: true
	}
}, {timestamps: true});

taskSchema.plugin(AutoIncrement, {inc_field: "id"});
export default mongoose.model("Task", taskSchema, "tasks");
