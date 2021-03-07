import axios from "axios";
import React, { useEffect, useState } from "react";
import classes from "./RegularChat.module.css";

const RegularChat = (props) => {
	const [user] = useState({
		_id: localStorage.getItem("_id"),
		username: localStorage.getItem("username"),
		token: localStorage.getItem("token"),
		admin: localStorage.getItem("admin"),
	});
	const [receiver, setReceiver] = useState(null);
	const [socket, setSocket] = useState(null);

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

			setReceiver(admin.data.admin);
		})();

		return () => {};
	});

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
