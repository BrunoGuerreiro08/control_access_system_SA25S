import express from 'express';
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { fileURLToPath } from 'url'
import path from 'path'
import loginRouter from './routes/loginRouter.js';
import googleLoginRouter from './routes/googleLoginRouter.js';
import dashboardRouter from './routes/dashboardRouter.js';
import resourceRouter from './routes/resourceRouter.js';
import registerRouter from './routes/registerRouter.js'
import authMiddleware from './middlewares/authMiddleware.js';
import session from 'express-session'
import passport from './lib/passport.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const app = express()
const port = process.env.PORT? process.env.PORT : 3000

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, './views'))

app.get('/', (req, res) => {
  res.redirect('/login')
})

app.use('/', loginRouter)
app.use('/', googleLoginRouter)
app.use('/', registerRouter)
app.use('/', authMiddleware, dashboardRouter)
app.use('/', authMiddleware, resourceRouter)


app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}/`)
})