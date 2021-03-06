import React, { useState } from "react";
import classes from "./App.module.css";
import { Switch, Route, Redirect } from "react-router-dom";
import Auth from "./containers/Auth/Auth";

function App() {
	const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState({});

  useEffect(() => {
    let isAuth = localStorage.getItem("token");
    if (isAuth) {
      setAuthenticated(true);
      setUser({
        _id: localStorage.getItem("_id"),
        username: localStorage.getItem("username")
      })
    }
    return () => {
      cleanup
    }
  }, [input])
  
  onLogin = ()

	return (
		<div className={classes.App}>
			<Switch>
				<Route path="/login">
					<Auth />
				</Route>
				<Route path="/">
					<Redirect to="/login" />
				</Route>
			</Switch>
		</div>
	);
}

export default App;
