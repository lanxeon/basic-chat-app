import React, { useState, useEffect } from "react";
import classes from "./App.module.css";
import { Switch, Route, Redirect } from "react-router-dom";

import Auth from "./containers/Auth/Auth";
import AdminChat from "./containers/AdminChat/AdminChat";
import RegularChat from "./containers/RegularChat/RegularChat";

function App() {
	const [authenticated, setAuthenticated] = useState(false);

	useEffect(() => {
		let isAuth = localStorage.getItem("token");
		if (isAuth) {
			setAuthenticated(true);
		}
	}, []);

	let redirect = authenticated ? (
		localStorage.getItem("admin") === "true" ? (
			<Redirect to="/chat/admin" />
		) : (
			<Redirect to="/chat/regular" />
		)
	) : null;

	return (
		<div className={classes.App}>
			<Switch>
				<Route path="/login">
					<Auth />
				</Route>
				<Route path="/chat/admin">
					<AdminChat auth={authenticated} />
				</Route>
				<Route path="/chat/regular">
					<RegularChat auth={authenticated} />
				</Route>
				<Route path="/">
					<Redirect to="/login" />
				</Route>
			</Switch>
			{redirect}
		</div>
	);
}

export default App;
