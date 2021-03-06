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
const io = socketIo(server);

//mongoose models
const { Room, User } = require("./models");

//routers
const regularRoutes = require("./routes/regular");
const adminRoutes = require("./routes/admin");

// function to parse the JWT
let parseJWT = (token) => {
	try {
		let payload = jsonwebtoken.verify(token);
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

	let user; //sender id
	let room; //room object in database
	let receiver; //receiver id

	socket.on("register active user", (payload) => {
		user = parseJWT(payload.token); //parse the _id of sender

		//add the user to the list of active users
		active_users[user] = {
			online: true,
			socketId: socket.id,
			last_seen: Date.now(),
		};

		socket.emit("user active", user._id);
	});

	socket.on("entered chat", async (payload) => {
		let user1 = user;
		if (!user1) return; // if unauthenticated user, then deny access
		let user2 = payload.receiver_id; //send the _id of receiver in the payload
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
			let roomId = _id;
			socket.join(roomId);
			socket.to(roomId).emit("created room", roomId);
		} else {
			socket.join(room._id);
			socket.to(roomId).emit("joined room", roomId);
		}
	});

	//on sending chat
	socket.on("send message", async (payload) => {
		let read = false;
		socket.to(room._id).emit("private message", payload);

		//incase if receiver is not in room
		if (active_users[receiver].online) {
			socket.to(active_users[receiver].socketId).emit("message notification", payload);
		}

		//in either case update the message history on backend
		room.messages.append({
			sender: user,
			msgType: payload.msgType,
			content: payload.message,
			timestamp: Date.now(),
			seen: read,
		});

		room = await room.save(); // update the model
	});

	//to handle socket disconnect
	socket.on("disconnect", () => {
		console.log(`client ${socket.id} disconnected`);

		//register last seen of user
		active_users[user] = {
			online: false,
			socketId: null,
			last_seen: Date.now(),
		};
	});
});

// Enable CORS, parse JSON and urelencoded repsectivelt
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/regular", regularRoutes);
app.use("/admin", adminRoutes);
