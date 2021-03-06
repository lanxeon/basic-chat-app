import React, { useState, useEffect } from "react";
import classes from "./AdminChat.module.css";

import socketClient from "socket.io-client";
import axios from "axios";

let server = "http://localhost:4000";

export default function AdminChat() {
	const [users, setUsers] = useState([]);
	const [user, setUser] = useState({
		_id: localStorage.getItem("_id"),
		username: localStorage.getItem("username"),
		token: localStorage.getItem("token"),
		admin: localStorage.getItem("admin"),
	});
	const [inChat, setInChat] = useState(false);

	useEffect(() => {
		let socket = socketClient(server);
		socket.on("connect", () => {
			console.log("User connected");
		});

		return () => {};
	}, []);

	useEffect(() => {
		(async () => {
			try {
				let usersList = await axios.get("http://localhost:4000/admin/users-list", {
					headers: { Authorization: `Bearer ${user.token}` },
				});

				setUsers(usersList.data.users);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [user]);

	return (
		<div className={classes.AdminChatWrapper}>
			<div className={classes.ChatArea}>{inChat ? "chat page" : "list of users"}</div>
		</div>
	);
}
