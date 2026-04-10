import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import ConnectSQLite from "connect-sqlite3";
import session from "express-session";
import passport from "./lib/passport.js";

// Routes Import
import loginRouter from "./routes/loginRouter.js";
import googleLoginRouter from "./routes/googleLoginRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import resourceRouter from "./routes/resourceRouter.js";
import registerRouter from "./routes/registerRouter.js";
import authMiddleware from "./middlewares/authMiddleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLiteStore = ConnectSQLite(session);
const app = express();
const port = process.env.PORT ? process.env.PORT : 3000;
// Idk about those
// const isProd = process.env.NODE_ENV === 'production'

// app.set('trust proxy', 1) // only if behind a reverse proxy (nginx, etc.)

app.use(
	session({
		store: new SQLiteStore({ db: "sessions.db", dir: "./prisma" }),
		name: "__Host-sid", // __Host- prefix locks to HTTPS + root path
		resave: false,
		saveUninitialized: false,
		cookie: {
			httpOnly: true,
			secure: isProd, // HTTPS only in production; false in dev so it works on localhost
			sameSite: "strict", // blocks all cross-site requests (upgrade to 'lax' if you need OAuth redirects to work across sites)
			maxAge: 1000 * 60 * 60 * 24, // 1 day
		},
	}),
);

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./views"));

app.get("/", (req, res) => {
	res.redirect("/login");
});

app.use("/", loginRouter);
app.use("/", googleLoginRouter);
app.use("/", registerRouter);
app.use("/", authMiddleware, dashboardRouter);
app.use("/", authMiddleware, resourceRouter);

app.listen(port, () => {
	console.log(`Server running on port http://localhost:${port}/`);
});
