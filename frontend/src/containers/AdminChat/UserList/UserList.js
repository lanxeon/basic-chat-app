import React from "react";
import classes from "./UserList.module.css";

function UserList(props) {
	return (
		<div className={classes.UserList}>
			{props.users.map((user) => (
				<div className={classes.UserDetails}>
					<div className={classes.imgContainer}>
						<img
							src="https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg"
							alt="lol"
						/>
					</div>
					<span className={classes.usn}>{user.username}</span>
				</div>
			))}
		</div>
	);
}

export default UserList;
