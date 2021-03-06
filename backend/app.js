//import the libraries
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jsonwebtoken = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require("cors");

//set up the express server as well as the socket server
const port = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

//mongoose models
const { Room, User } = require("./models");

//routers
const regularRoutes = require("./routes/regular");
const adminRoutes = require("./routes/admin");
const { emit } = require("process");
const parseToken = require("./middlewares/parse-token");

// function to parse the JWT
let parseJWT = (token) => {
	try {
		let payload = jsonwebtoken.verify(token, "SuPeR sEcReT kEy mc3om8c3831yj53admdasmlk34989du");
		return payload;
	} catch (err) {
		return null;
	}
};

//current active users
let active_users = {};

//connect to mongoDB server
mongoose
	.connect("mongodb://localhost:27017/chat", {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("db connected!"))
	.catch(() => console.log("db conn failed!"));

//launch the server
server.listen(port, () => console.log("backend listening on port " + port));

// SOCKET CONNECTION
io.on("connection", (socket) => {
	console.log(`new client connected! socketId: ${socket.id}`);

	let user; //sender object
	let room; //room object in database
	let roomId; //roomId
	let receiver; //receiver id

	socket.on("register active user", (payload) => {
		user = parseJWT(payload.token); //parse the _id of sender

		if (!user) {
			socket.emit("could not verify user", payload);
			return;
		}

		//add the user to the list of active users
		active_users[user._id.toString()] = {
			online: true,
			socketId: socket.id,
			last_seen: Date.now(),
		};

		console.log("Registered user as active!");
		console.log({ ...active_users[user._id.toString()], _id: user._id.toString() });
		io.emit("user activity change", { _id: user._id.toString() });
		socket.emit("user active", user._id.toString());
	});

	socket.on("entered chat", async (payload) => {
		let user1 = user;
		if (!user1) return; // if unauthenticated user, then deny access
		let user2 = payload.receiver_id.toString(); //send the _id of receiver in the payload
		receiver = user2;

		//check if room exists
		room = await Room.findOne({
			$or: [
				{ user1: user1, user2: user2 },
				{ user1: user2, user2: user1 },
			],
		});

		if (!room) {
			let newRoom = new Room({
				user1: user1,
				user2: user2,
				messages: [],
			});

			room = await newRoom.save();
			roomId = room._id.toString();
			socket.join(roomId);
			console.log("created and joined room");
			io.to(roomId).emit("joined room", roomId);
		} else {
			roomId = room._id.toString();
			socket.join(roomId);
			console.log("joined room " + roomId);
			io.to(roomId).emit("joined room", roomId);
		}
	});

	//get signal to send user activity details
	socket.on("get user activity", (recvid) => {
		let activity = active_users[recvid.toString()];
		socket.emit("receiver activity details", activity);
	});

	//on sending chat
	socket.on("send message", async (message) => {
		let read = false;

		console.log(`send message from ${socket.id}`);

		//in either case update the message history on backend
		room.messages.push({
			sender: user,
			msgType: message.msgType,
			content: message.content,
			timestamp: Date.now(),
			seen: read,
		});

		try {
			room = await room.save(); // update the model
		} catch (err) {
			console.log(err);
		}

		let messageToSend = room ? room.messages[room.messages.length - 1] : null;

		if (messageToSend) {
			io.to(roomId).emit("private message", messageToSend);

			//incase if receiver is not in room
			if (active_users[receiver] && active_users[receiver].online) {
				io.to(active_users[receiver].socketId).emit("message notification", messageToSend);
			}
		}
	});

	// //on receiving chat
	// socket.on("receive message", (message) => {
	// 	console.log("message received at server");
	// 	socket.to(room._id).emit("new message", message);
	// });

	socket.on("left chat", () => {
		console.log("User has left chat!");
		if (room) socket.leave(roomId);
	});

	//to handle socket disconnect
	socket.on("disconnect", () => {
		console.log(`client ${socket.id} disconnected`);

		//register last seen of user
		active_users[user._id] = {
			online: false,
			socketId: null,
			last_seen: Date.now(),
		};

		//emit to the room that user has gone offline
		if (room) io.emit("user left chat");
		//emit that the user is no longer active
		io.to(roomId).emit("user activity change", { _id: user._id.toString() });
	});
});

// Enable CORS, parse JSON and urelencoded repsectivelt
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/regular", regularRoutes);
app.use("/admin", adminRoutes);

app.get("/chats/:receiver", parseToken, async (req, res) => {
	try {
		let room;
		try {
			room = await Room.findOne({
				$or: [
					{ user1: req.body.user._id, user2: req.params.receiver },
					{ user1: req.params.receiver, user2: req.body.user._id },
				],
			});
		} catch (err) {
			console.log(err);
			return res.status(500).json({
				message: "Something went wrong",
			});
		}

		if (!room)
			return res.status(200).json({
				message: "No chats exist between the 2 yet",
				messages: [],
			});

		let messages = room.messages;
		res.status(200).json({
			message: "Chats Found!",
			messages: messages,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});
