import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import prisma from './prisma.js'
import { LEVELS } from '../utils/securityLevels.js'

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await prisma.user.findUnique({ where: { username: profile.emails[0].value } })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          username: profile.emails[0].value,
          password: '',
          clearanceLevel: LEVELS.UNCLASSIFIED
        }
      })
      user._isNew = true  // attach flag directly to the object
    }

    return done(null, user)
  } catch (err) {
    return done(err)
  }
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  const user = await prisma.user.findUnique({ where: { id } })
  done(null, user)
})

export default passport