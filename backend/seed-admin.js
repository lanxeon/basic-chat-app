const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let { User } = require("./models");

//connect to mongoDB server
mongoose
	.connect("mongodb://localhost:27017/chat", {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: true,
		useUnifiedTopology: true,
	})
	.then(async () => {
		console.log("db connected!");

		try {
			let user = new User({
				username: "admin",
				password: bcrypt.hashSync("test", 10),
				admin: true,
			});

			await user.save();
		} catch (err) {
			console.log(err);
		}
	})
	.catch(() => console.log("db conn failed!"));
