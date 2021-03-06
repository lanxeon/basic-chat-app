const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema({
	user1: { type: mongoose.SchemaTypes.ObjectId, required: true, index: true },
	user2: { type: mongoose.SchemaTypes.ObjectId, required: true, index: true },

	messages: [
		{
			sender: mongoose.SchemaTypes.ObjectId,
			msgType: { type: String, enum: ["text", "image", "video"] },
			content: mongoose.SchemaTypes.Mixed,
			timestamp: Date,
			seen: Boolean,
		},
	],
});

const UserSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },

	admin: Boolean,
});

module.exports = {
	User: mongoose.model("User", UserSchema),
	Room: mongoose.model("Room", RoomSchema),
};
