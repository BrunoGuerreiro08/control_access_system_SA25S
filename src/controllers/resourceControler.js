import prisma from "../lib/prisma.js";
import logger from '../lib/logger.js'
import { canRead, canWrite } from '../policies/policies.js'
import { LEVELS } from '../utils/securityLevels.js'

export const getResource = async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(req.params.id) }
    })

    if (!resource) {
      logger.warn({ userId: req.user.id, resourceId: req.params.id }, 'Resource not found')
      return handleResponse(res, 404, 'Resource not found')
    }

    if (!canRead(req.user, resource)) {
      logger.warn({ userId: req.user.id, username: req.user.username, resourceId: resource.id, userClearance: req.user.clearanceLevel, resourceLevel: resource.classificationLevel }, 'No Read Up violation: access denied')
      return res.redirect('/dashboard?error=Access denied: insufficient clearance level')
    }

    logger.info({ userId: req.user.id, username: req.user.username, resourceId: resource.id, resourceLevel: resource.classificationLevel }, 'Resource accessed')
    res.render('resource', { user: req.user, resource })
  } catch (err) {
    logger.error({ err }, 'Unexpected error fetching resource')
    next(err)
  }
}

export const createResource = async (req, res, next) => {
  try {
    const { content, classificationLevel } = req.body

    if (req.user.clearanceLevel < LEVELS.SECRET) {
      logger.warn({ userId: req.user.id, username: req.user.username, userClearance: req.user.clearanceLevel }, 'Unauthorized resource creation attempt: insufficient clearance')
      return res.render('createResource', {
        error: 'Access denied: only users with SECRET clearance or above can create resources.',
        levels: LEVELS
      })
    }

    if (!content || classificationLevel === undefined) {
      return res.render('createResource', { error: 'All fields are required.', levels: LEVELS })
    }

    const requestedLevel = parseInt(classificationLevel)
    const targetResource = { classificationLevel: requestedLevel }
    const writeDown = !canWrite(req.user, targetResource)
    const finalLevel = writeDown ? req.user.clearanceLevel : requestedLevel

    await prisma.resource.create({
      data: { content, classificationLevel: finalLevel }
    })

    if (writeDown) {
      logger.warn({ userId: req.user.id, username: req.user.username, requestedLevel, finalLevel }, 'No Write Down violation: resource classification elevated to user clearance level')
    } else {
      logger.info({ userId: req.user.id, username: req.user.username, classificationLevel: finalLevel }, 'Resource created')
    }

    const redirect = writeDown
      ? `/dashboard?warning=No Write Down violation: resource classification was elevated to your clearance level (${finalLevel}).`
      : '/dashboard'

    res.redirect(redirect)
  } catch (err) {
    logger.error({ err }, 'Unexpected error creating resource')
    next(err)
  }
}