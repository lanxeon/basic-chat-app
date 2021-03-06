import React, { useState, useEffect } from "react";
import classes from "./App.module.css";
import { Switch, Route, Redirect } from "react-router-dom";
import Auth from "./containers/Auth/Auth";

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
				<Route path="/chat/admin">admin chat</Route>
				<Route path="/chat/regular">regular chat</Route>
				<Route path="/">
					<Redirect to="/login" />
				</Route>
			</Switch>
			{redirect}
		</div>
	);
}

export default App;
