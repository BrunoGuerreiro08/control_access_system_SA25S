import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import { LEVELS } from "../utils/securityLevels.js";

export const searchUsers = async (req, res, next) => {
	try {
		// Only TOP SECRET users can query the user list — enforced server-side,
		// never trust the client to self-report their clearance level
		if (req.user.clearanceLevel < LEVELS.TOP_SECRET) {
			logger.warn(
				{
					userId: req.user.id,
					username: req.user.username,
					clearance: req.user.clearanceLevel,
				},
				"Unauthorized attempt to access user list",
			);
			return res.redirect(
				"/dashboard?error=Access denied: TOP SECRET clearance required.",
			);
		}

		const { username } = req.query;

		const users = await prisma.user.findMany({
			where: username
				? { username: { contains: username } } // parameterized — safe
				: undefined, // no filter — returns all users
			select: {
				id: true,
				username: true,
				clearanceLevel: true,
				// password is explicitly excluded — never expose hashes to any client
			},
			orderBy: { clearanceLevel: "desc" },
		});

		logger.info(
			{
				userId: req.user.id,
				username: req.user.username,
				resultCount: users.length,
				filter: username ?? "none",
			},
			"User list accessed",
		);

		res.render("user", { user: req.user, users, filter: username ?? "" });
	} catch (err) {
		logger.error({ err }, "Unexpected error fetching users");
		next(err);
	}
};
