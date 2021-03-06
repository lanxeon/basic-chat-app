import React from "react";
import classes from "./UserList.module.css";

function UserList(props) {
	return (
		<div className={classes.UserList}>
			{props.users.map((user) => (
				<div className={classes.UserDetails}>
					<span>user.username</span>
				</div>
			))}
		</div>
	);
}

export default UserList;
