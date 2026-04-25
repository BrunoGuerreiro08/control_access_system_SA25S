import "../lib/env.js";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import passport from "../lib/passport.js";

export const handleResponse = (res, status, message, data = null) => {
	return res.status(status).json({
		status,
		message,
		data,
	});
};

export const loginControler = (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) return next(err);

		if (!user) {
			return res.render("login", {
				username: req.body.username ?? "",
				error: info?.message ?? "Invalid credentials",
			});
		}

		req.login(user, (err) => {
			if (err) return next(err);
			logger.info(
				{ userId: user.id, username: user.username },
				"Session created",
			);
			res.redirect("/dashboard");
		});
	})(req, res, next);
};
