import React, { useState, useEffect } from "react";
import classes from "./Chat.module.css";

import axios from "axios";

export default function Chat(props) {
	const [receiverActive, setReceiverActive] = useState(null);
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		//get chats
		(async () => {
			try {
				let messageDb = await axios.get("http://localhost:4000/chats", {
					headers: { Authorization: `Bearer ${props.user.token}` },
				});

				setMessages(messageDb);
			} catch (err) {}
		})();
	});

	//on entering room successfully
	props.socket.on("joined room", (payload) => props.socket.emit("get user activity", props.receiver._id));
	//on getting receiver details
	props.socket.on("receiver activity details", (payload) => setReceiverActive(payload));

	return (
		<div className={classes.ChatWrapper}>
			<div className={classes.TopUser}>
				<div className={classes.imgContainer}>
					<img
						src="https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
						alt="lol"
					/>
				</div>
				<span className={classes.usn}>{props.receiver.username}</span>
				<div className={classes.Online}>
					{receiverActive
						? receiverActive.online
							? "Online"
							: receiverActive.last_seen
						: "offline"}
				</div>
			</div>

			<div className={classes.ChatListContainer}>
				{messages.map((message) => (
					<div className={classes.MessageContainer}>
						<span
							className={`${classes.Message} ${
								message.sender === props.sender._id ? classes.Sender : classes.Receiver
							}`}
						/>
					</div>
				))}
			</div>
		</div>
	);
}
