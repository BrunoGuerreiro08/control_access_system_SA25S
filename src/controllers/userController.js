import prisma from "../lib/prisma.js";
import logger from "../lib/logger.js";
import { LEVELS } from "../utils/securityLevels.js";

export const searchUsers = async (req, res, next) => {
	try {
		// ── Clearance gate ────────────────────────────────────────────
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

		// ── SQL Injection protection — Prisma ORM (parameterized queries) ──
		//
		// Prisma NEVER interpolates user input directly into SQL strings.
		// The `username` value below is passed as a bound parameter at the
		// database driver level, so a malicious input like:
		//
		//   ?username=' OR '1'='1
		//
		// is treated as a literal string to match against, not as SQL syntax.
		// This makes classic SQL injection structurally impossible through the ORM.
		//
		// Equivalent raw SQL (what Prisma generates internally):
		//   SELECT * FROM User WHERE username LIKE ?  -- `?` is the bound parameter
		//
		// NEVER do this (vulnerable):
		//   prisma.$queryRawUnsafe(`SELECT * FROM User WHERE username LIKE '%${username}%'`)

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

		// ── SQL Injection protection — Prisma $queryRaw (tagged template) ──
		//
		// If you ever need a raw query (complex joins, DB-specific functions),
		// use $queryRaw with a tagged template literal — NOT $queryRawUnsafe.
		// The tagged template syntax automatically parameterizes interpolated values:
		//
		//   const results = await prisma.$queryRaw`
		//     SELECT id, username, clearanceLevel
		//     FROM User
		//     WHERE clearanceLevel = ${req.user.clearanceLevel}
		//   `
		//
		// The ${} values are bound parameters, not string concatenation.
		// $queryRawUnsafe() skips this — only use it with fully static strings.

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
