const jwt = require("jsonwebtoken");

const parseToken = async (req, res, next) => {
	try {
		let token = req.headers["Authorization"].split("\n")[1];
		let payload = jwt.verify(token, "SuPeR sEcReT kEy mc3om8c3831yj53admdasmlk34989du");

		req.body.user = payload;
		next();
	} catch (err) {
		return res.status(401).json({
			message: "Unauthorized!",
		});
	}
};
