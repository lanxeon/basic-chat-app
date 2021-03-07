import React, { useState, useEffect } from "react";
import classes from "./Chat.module.css";

import axios from "axios";

export default function Chat(props) {
	const [receiverActive, setReceiverActive] = useState(null);
	const [messages, setMessages] = useState([]);
	const [text, setText] = useState("");

	useEffect(() => {
		console.log("Entered useEffect");
		//get chats
		(async () => {
			try {
				let messageDb = await axios.get("http://localhost:4000/chats/" + props.receiver._id, {
					headers: { Authorization: `Bearer ${props.sender.token}` },
				});

				console.log(messageDb);

				setMessages(messageDb.data.messages);
			} catch (err) {
				console.log(err);
			}
		})();
	}, [props.sender]);

	useEffect(() => {
		//on entering room successfully
		props.socket.on("joined room", (payload) =>
			props.socket.emit("get user activity", props.receiver._id)
		);
		//on getting receiver details
		props.socket.on("receiver activity details", (payload) => setReceiverActive(payload));
		//on new message
		props.socket.on("private message", (msg) => {
			console.log(msg);
			setMessages((msgs) => [...msgs, msg]);
		});
	}, []);

	const sendMessageHandler = () => {
		if (text.length === 0) return;

		console.log("emitting send message from client side");

		props.socket.emit("send message", {
			sender: props.sender,
			msgType: "text",
			content: text,
		});

		setText("");
	};

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
						: "Offline"}
				</div>
			</div>

			<div className={classes.ChatListContainer}>
				{messages.map((message) => (
					<div
						className={`${classes.MessageContainer} ${
							message.sender === props.sender._id ? classes.Sender : classes.Receiver
						}`}
					>
						<span
							className={`${classes.Message} ${
								message.sender === props.sender._id
									? classes.SenderText
									: classes.ReceiverText
							}`}
						>
							{message.content}
						</span>
					</div>
				))}
			</div>
			<div className={classes.msgBar}>
				<div className={classes.TextArea}>
					{/* <input type="file" id = "attachment" name = "attachment" style="display: none;">
                    <button id ="attach_file" class = "btn info attach" onclick="document.getElementById('attachment').click()">
                        <i class="material-icons">attach_file</i>
                    </button> */}
					<textarea
						rows="3"
						cols="80"
						className={classes.MyMessage}
						placeholder="Type or gesture a message"
						value={text}
						onChange={(e) => setText(e.target.value)}
					></textarea>
					<button
						className={`${classes.btn} ${classes.info} ${classes.send}`}
						onClick={sendMessageHandler}
					>
						<i className="material-icons">send</i>
					</button>
				</div>
			</div>
		</div>
	);
}
