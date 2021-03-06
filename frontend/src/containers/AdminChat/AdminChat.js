import React, { useState, useEffect } from "react";
import classes from "./AdminChat.module.css";

import UserList from "./UserList/UserList";

import socketClient from "socket.io-client";
import axios from "axios";
import { Redirect } from "react-router";

let server = "http://localhost:4000";

export default function AdminChat(props) {
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

				console.log(usersList.data.users);
				setUsers(usersList.data.users);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [user]);

	let redirect = !props.auth ? <Redirect to="/login" /> : null;

	return (
		<div className={classes.AdminChatWrapper}>
			<div className={classes.ChatArea}>
				<div className={classes.ContentWrapper}>
					<div className={classes.Header}>
						<button disabled={!inChat}>BACK</button>{" "}
						<button
							onClick={() => {
								localStorage.clear();
								window.location.reload();
							}}
						>
							LOGOUT
						</button>
					</div>
					{inChat ? "chat page" : <UserList users={users} />}
				</div>
			</div>

			{redirect}
		</div>
	);
}
