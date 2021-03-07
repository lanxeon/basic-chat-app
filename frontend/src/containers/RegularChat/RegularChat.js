import axios from "axios";
import React, { useEffect, useState } from "react";
import classes from "./RegularChat.module.css";

import socketClient from "socket.io-client";

const RegularChat = (props) => {
	const [user] = useState({
		_id: localStorage.getItem("_id"),
		username: localStorage.getItem("username"),
		token: localStorage.getItem("token"),
		admin: localStorage.getItem("admin"),
	});
	const [receiver, setReceiver] = useState(null);
	const [receiverActive, setReceiverActive] = useState(null);
	const [Socket, setSocket] = useState(null);
	const [messages, setMessages] = useState([]);

	//get the admin's _id first
	useEffect(() => {
		(async () => {
			let admin;
			try {
				admin = await axios.get("/regular/get-admin", {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});
			} catch (err) {
				console.log(err);
			}

			if (admin) setReceiver(admin.data.admin);
		})();
		let socket = socketClient("http://localhost:4000");
		socket.on("connect", () => {
			console.log("User connected");

			//now register user as online
			socket.emit("register active user", { token: user.token });

			socket.on("user activity change", (payload) => {
				if (payload._id === receiver._id) Socket.emit("get user activity", receiver._id);
			});

			//on entering room successfully
			socket.on("joined room", (payload) => socket.emit("get user activity", receiver._id));

			//on getting receiver details
			socket.on("receiver activity details", (payload) => setReceiverActive(payload));

			//on new message
			socket.on("private message", (msg) => {
				console.log(msg);
				setMessages((msgs) => [...msgs, msg]);
			});
		});

		setSocket(socket);

		return () => {
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		if (receiver && Socket) Socket.emit("entered chat", { receiver_id: receiver._id });
	}, [Socket, receiver]);

	return (
		<div className={classes.RegularChatWrapper}>
			<div>
				<div className={`${classes.Top} ${classes.UserBar}`}>
					<div className={classes.back}>
						<i className="zmdi zmdi-arrow-left"></i>
					</div>
					<div className={classes.avatar}>
						<img
							src="https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
							alt="Avatar"
						/>
					</div>
					<div className={classes.name}>
						<span>{user.username}</span>
						<span className={classes.status}>online</span>
					</div>
					<div className={`${classes.actions} ${classes.more}`}>
						<i className="zmdi zmdi-more-vert"></i>
					</div>
					<div className={`${classes.actions} ${classes.attachment}`}>
						<i className="zmdi zmdi-phone"></i>
					</div>
					<div className={`${classes.actions}`}>
						<img src="https://i.ibb.co/LdnbHSG/ic-action-videocall.png" alt="lol" />
					</div>
					<button
						onClick={() => {
							localStorage.clear();
							window.location.reload();
						}}
					>
						LOGOUT
					</button>
				</div>
			</div>
		</div>
	);
};

export default RegularChat;
