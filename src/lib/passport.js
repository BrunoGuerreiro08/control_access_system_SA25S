import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "./prisma.js";
import bcrypt from "bcrypt";
import logger from "./logger.js";
import { LEVELS } from "../utils/securityLevels.js";

// Local strategy for local login
passport.use(
	new LocalStrategy(
		{ usernameField: "username", passwordField: "password" },
		async (username, password, done) => {
			try {
				const user = await prisma.user.findUnique({ where: { username } });
				if (!user) {
					logger.warn({ username }, "Failed login: user not found");
					return done(null, false, { message: "Invalid credentials" });
				}
				const valid = await bcrypt.compare(password, user.password);
				if (!valid) {
					logger.warn({ username }, "Failed login: wrong password");
					return done(null, false, { message: "Invalid credentials" });
				}
				logger.info({ userId: user.id, username }, "User logged in");
				return done(null, user);
			} catch (err) {
				return done(err);
			}
		},
	),
);

// Google strategy for OAuth
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: "/auth/google/callback",
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				let user = await prisma.user.findUnique({
					where: { username: profile.emails[0].value },
				});

				if (!user) {
					user = await prisma.user.create({
						data: {
							username: profile.emails[0].value,
							password: "",
							clearanceLevel: LEVELS.UNCLASSIFIED,
						},
					});
					user._isNew = true; // attach flag directly to the object
				}

				return done(null, user);
			} catch (err) {
				return done(err);
			}
		},
	),
);

// Session serialization
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
	try {
		const user = await prisma.user.findUnique({ where: { id } });
		done(null, user);
	} catch (err) {
		done(err);
	}
});

export default passport;
