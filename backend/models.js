const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema({
	user1: { type: mongoose.SchemaTypes.ObjectId, required: true, index: true },
	user2: { type: mongoose.SchemaTypes.ObjectId, required: true, index: true },

	messages: [
		{
			sender: mongoose.SchemaTypes.ObjectId,
			timestamp: Date,
			seen: Boolean,
		},
	],
});

const UserSchema = mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
});

module.exports = {
	User: mongoose.model("User", UserSchema),
	Room: mongoose.model("Room", RoomSchema),
};
