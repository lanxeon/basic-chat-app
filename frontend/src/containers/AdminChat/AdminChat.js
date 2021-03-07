import React, { useState, useEffect } from "react";
import classes from "./AdminChat.module.css";

import UserList from "./UserList/UserList";
import Chat from "./Chat/Chat";

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
	const [receiver, setReceiver] = useState({});
	const [inChat, setInChat] = useState(false);
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		let socket = socketClient(server);
		socket.on("connect", () => {
			console.log("User connected");

			//now register user as online
			socket.emit("register active user", { token: user.token });
		});

		setSocket(socket);

		return () => {
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		(async () => {
			try {
				let usersList = await axios.get("http://localhost:4000/admin/users-list", {
					headers: { Authorization: `Bearer ${user.token}` },
				});

				// console.log(usersList.data.users);
				setUsers(usersList.data.users);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [user]);

	useEffect(() => {
		if (inChat && receiver && socket) socket.emit("entered chat", { receiver_id: receiver._id });
	}, [inChat, receiver, socket]);

	//to enter chat room
	let enterChat = (user) => {
		setReceiver(user);
		setInChat(true);
	};

	//to redirect if user is not authenticated
	let redirect = !props.auth ? <Redirect to="/login" /> : null;

	return (
		<div className={classes.AdminChatWrapper}>
			<div className={classes.ChatArea}>
				<div className={classes.ContentWrapper}>
					<div className={classes.Header}>
						<button
							disabled={!inChat}
							onClick={() => {
								setInChat(false);
								setReceiver(false);
							}}
						>
							BACK
						</button>{" "}
						<button
							onClick={() => {
								localStorage.clear();
								window.location.reload();
							}}
						>
							LOGOUT
						</button>
					</div>
					{inChat ? (
						<Chat socket={socket} receiver={receiver} sender={user} />
					) : (
						<UserList users={users} enterChat={enterChat} />
					)}
				</div>
			</div>

			{redirect}
		</div>
	);
}
