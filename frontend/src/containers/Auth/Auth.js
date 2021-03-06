import React, { useEffect, useState } from "react";
import classes from "./Auth.module.css";

const axios = require("axios").default;

const Auth = (props) => {
	const [login, setLogin] = useState(true);
	const [admin, setAdmin] = useState(false);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		console.log("Entered useEffect");
	});

	let loginHandler = async () => {
		let loggedIn;
		try {
			loggedIn = await axios.post(`http://localhost:4000/${admin ? "admin" : "regular"}/login`, {
				usn: username,
				pwd: password,
			});
			console.log(loggedIn.data);

			localStorage.setItem("token", loggedIn.data.token);
			localStorage.setItem("_id", loggedIn.data._id);
			localStorage.setItem("username", loggedIn.data.username);
			localStorage.setItem("admin", loggedIn.data.admin);

			window.location.reload();
		} catch (err) {
			console.log(err);
		}
	};

	let registerHandler = async () => {
		let registered;
		try {
			registered = await axios.post(`http://localhost:4000/${admin ? "admin" : "regular"}/register`, {
				usn: username,
				pwd: password,
			});
			console.log(registered.data);
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className={classes}>
			<div className={classes.LoginRegisterWrapper}>
				<h2>Login/Register</h2>

				<div className={classes.form}>
					<form>
						<div className={classes.input}>
							<span>username </span>
							<div className={classes.flex}></div>
							<input
								type="text"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								minLength="4"
								maxLength="15"
							></input>
						</div>
						<div className={classes.input}>
							<span>password </span>
							<div className={classes.flex}></div>
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								minLength="4"
								maxLength="15"
							></input>
						</div>

						<div>
							<label htmlFor="admin">Login as admin</label>
							<input
								type="checkbox"
								name="admin"
								checked={admin}
								onChange={() => setAdmin((old) => !old)}
							></input>
						</div>

						<button type="button" onClick={loginHandler}>
							Login
						</button>
						<button type="button" onClick={registerHandler} disabled={admin}>
							Register
						</button>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Auth;
