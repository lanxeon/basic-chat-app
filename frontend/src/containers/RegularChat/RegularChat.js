import axios from "axios";
import React, { useEffect, useState } from "react";
import classes from "./RegularChat.module.css";

import { Redirect } from "react-router-dom";

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
	const [text, setText] = useState("");

	let handleInput = (e) => {
		setText(e.target.value);
	};

	let handleSubmit = (e) => {
		e.preventDefault();

		if (text.length === 0) return;

		console.log("emitting send message from client side");

		Socket.emit("send message", {
			sender: user._id,
			msgType: "text",
			content: text,
		});

		setText("");
	};

	//get the admin's _id first
	useEffect(() => {
		(async () => {
			let admin;
			try {
				admin = await axios.get("http://localhost:4000/regular/get-admin", {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});
			} catch (err) {
				console.log(err);
			}

			if (admin) setReceiver(admin.data.admin);

			let msgs;
			try {
				msgs = await axios.get(`http://localhost:4000/chats/${admin.data.admin._id}`, {
					headers: {
						Authorization: `Bearer ${user.token}`,
					},
				});
			} catch (err) {
				console.log(err);
			}

			if (msgs) setMessages(msgs.data.messages);
		})();
		let socket = socketClient("http://localhost:4000");
		socket.on("connect", () => {
			console.log("User connected");

			//now register user as online
			socket.emit("register active user", { token: user.token });

			// //checking is user is active
			// socket.on("user activity change", (payload) => {
			// 	if (payload._id === receiver._id) Socket.emit("get user activity", receiver._id);
			// });

			//on getting receiver details
			socket.on("receiver activity details", (payload) => {
				console.log("yay user is updating", payload);
				setReceiverActive(payload);
			});

			//on new message
			socket.on("private message", (msg) => {
				console.log("hit the private message event");
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
		if (receiver && Socket) {
			// //checking is user is active
			// Socket.on("user activity change", (payload) => {
			// 	if (payload._id === receiver._id) Socket.emit("get user activity", receiver._id);
			// });
			//on entering room successfully
			Socket.on("joined room", (payload) => {
				console.log("joined room");
				Socket.emit("get user activity", receiver._id);
			});

			console.log("going to emit the event!");

			Socket.emit("entered chat", { receiver_id: receiver._id });
		}
	}, [Socket, receiver]);

	//to redirect if user is not authenticated
	let redirect = !props.auth ? <Redirect to="/login" /> : null;

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
						<span>{receiver ? receiver.username : null}</span>
						<span className={classes.status}>
							{receiverActive
								? receiverActive.online
									? "online"
									: "last seen xxx"
								: "offline"}
						</span>
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

				<div className={classes["conversation"]}>
					<div className={classes["conversation-container"]}>
						{/* <div className={[classes["message"], classes["sent"]].join(" ")}>
							What happened last night swaibu?
							<span className={classes["metadata"]}>
								<span className={classes["time"]}></span>
								<span className={classes["tick"]}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="15"
										id="msg-dblcheck-ack"
										x="2063"
										y="2076"
									>
										<path
											d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
											fill="#4fc3f7"
										/>
									</svg>
								</span>
							</span>
						</div>
						<div className={[classes.message, classes.received].join(" ")}>
							You were drunk.
							<span className={classes["metadata"]}>
								<span className={classes["time"]}></span>
							</span>
						</div>
						<div className={[classes["message"], classes["sent"]].join(" ")}>
							No I wasn't.
							<span className={classes["metadata"]}>
								<span className={classes["time"]}></span>
								<span className={classes["tick"]}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="16"
										height="15"
										id="msg-dblcheck-ack"
										x="2063"
										y="2076"
									>
										<path
											d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
											fill="#4fc3f7"
										/>
									</svg>
								</span>
							</span>
						</div>
						<div className={[classes["message"], classes["received"]].join(" ")}>
							<span>
								You were hugging an old man with a beard screaming "DUMBLEDORE YOU'RE ALIVE!"
							</span>
							<span className={classes["metadata"]}>
								<span className={classes["time"]}></span>
							</span>
						</div> */}

						{messages.map((message) => (
							<div
								key={message._id}
								className={[
									classes["message"],
									message.sender === user._id ? classes["sent"] : classes["received"],
								].join(" ")}
							>
								<span>{message.content}</span>
								<span className={classes.metadata}>
									<span className={classes.time}>{message.timestamp.toLocaleString()}</span>
									{message.sender === user._id && (
										<span className={classes["tick"]}>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="15"
												id="msg-dblcheck-ack"
												x="2063"
												y="2076"
											>
												<path
													d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.267a.32.32 0 0 0 .484-.034l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185a.32.32 0 0 0 .484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
													fill={message.seen ? "#4fc3f7" : "#222"}
												/>
											</svg>
										</span>
									)}
								</span>
							</div>
						))}
					</div>
					<form className={classes["conversation-compose"]} onSubmit={handleSubmit}>
						<div className={classes["emoji"]}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								id="smiley"
								x="3147"
								y="3209"
							>
								<path
									fillRule="evenodd"
									clipRule="evenodd"
									d="M9.153 11.603c.795 0 1.44-.88 1.44-1.962s-.645-1.96-1.44-1.96c-.795 0-1.44.88-1.44 1.96s.645 1.965 1.44 1.965zM5.95 12.965c-.027-.307-.132 5.218 6.062 5.55 6.066-.25 6.066-5.55 6.066-5.55-6.078 1.416-12.13 0-12.13 0zm11.362 1.108s-.67 1.96-5.05 1.96c-3.506 0-5.39-1.165-5.608-1.96 0 0 5.912 1.055 10.658 0zM11.804 1.01C5.61 1.01.978 6.034.978 12.23s4.826 10.76 11.02 10.76S23.02 18.424 23.02 12.23c0-6.197-5.02-11.22-11.216-11.22zM12 21.355c-5.273 0-9.38-3.886-9.38-9.16 0-5.272 3.94-9.547 9.214-9.547a9.548 9.548 0 0 1 9.548 9.548c0 5.272-4.11 9.16-9.382 9.16zm3.108-9.75c.795 0 1.44-.88 1.44-1.963s-.645-1.96-1.44-1.96c-.795 0-1.44.878-1.44 1.96s.645 1.963 1.44 1.963z"
									fill="#7d8489"
								/>
							</svg>
						</div>
						<input
							className={classes["input-msg"]}
							value={text}
							onChange={handleInput}
							placeholder="Type a mes.."
							autoComplete="off"
							autoFocus
						/>
						<div className={classes["photo"]}>
							<img src="https://i.ibb.co/zNL2yg0/ib-attach.png" alt="" width="25" height="25" />
							<img src="https://i.ibb.co/vHXYtHF/ib-camera.png" alt="" width="25" height="25" />
						</div>
						<button className={classes["send"]}>
							<div className={classes["circle"]}>
								<i className="zmdi zmdi-mic"></i>
							</div>
						</button>
					</form>
				</div>
			</div>
			{redirect}
		</div>
	);
};

export default RegularChat;
