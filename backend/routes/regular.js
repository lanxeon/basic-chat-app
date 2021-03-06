const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

//mongoose models
const { Room, User } = require("../models");

//to register customer
router.post("/register", async (req, res, next) => {
	try {
		let username = req.body.usn;
		let password = req.body.pwd;

		let newUser = new User({
			username: username,
			password: bcrypt.hashSync(password, 10),
		});

		let user;

		try {
			user = await newUser.save();
		} catch (err) {
			return res.status(400).json(err);
		}

		return res.status(201).json({
			message: "User Registered!",
			user: {
				_id: user._id,
				username: user.username,
			},
		});
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
});

//to login customer
router.post("/login", async (req, res, next) => {
	try {
		let username = req.body.usn;
		let password = req.body.pwd;

		let user;
		try {
			user = await User.findOne({
				username: username,
				// password: bcrypt.hashSync(password, 10),
			});
		} catch (err) {
			console.log(err);
			return res.status(500).json(err);
		}

		if (!user)
			return res.status(400).json({
				message: "Invalid username or password",
			});

		let passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) return res.status(400).json({ message: "Invalid username or password" });

		//create the jwt
		let token = jsonwebtoken.sign(
			{ _id: user._id, username: user.username },
			"SuPeR sEcReT kEy mc3om8c3831yj53admdasmlk34989du"
			// { expiresIn: "15m" }
		);

		res.status(200).json({
			message: "user successfully signed in",
			username: user.username,
			_id: user._id,
			token: token,
			admin: false,
		});
	} catch (err) {
		console.log(err);
		res.status(500).json(err);
	}
});

module.exports = router;
