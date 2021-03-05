//import the libraries
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jsonwebtoken = require("jsonwebtoken");

//set up the express server as well as the socket server
const port = process.env.PORT || 4000;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// function to parse the JWT
let parseJWT = async (token) => {
	try {
		let payload = jsonwebtoken.verify(token);
		return payload;
	} catch (err) {
		return null;
	}
};

//launch the server
server.listen(port, (port) => console.log("backend listening on port " + port));

// on each connection
io.on("connection", (socket) => {
	console.log(`new client connected! socketId: ${socket.id}`);

	socket.on("entered room", (payload) => {
		let user1 = parseJWT(payload.token); //parse the _id of sender
		if (!user1) return; // if unauthenticated user, then deny access
		let user2 = payload.receiver_id; //send the _id of receiver in the payload
	});

	//to handle socket disconnect socket
	socket.on("disconnect", () => console.log(`client ${socket.id} disconnected`));
});
