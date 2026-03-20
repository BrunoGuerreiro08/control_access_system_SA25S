import prisma from "../lib/prisma.js";
import { canRead } from "../policies/policies.js";

export const dashboardControler = async (req, res, next) => {
  try {
    const resources = await prisma.resource.findMany()

    const resourcesWithAccess = resources.map(r => ({
      ...r,
      accessible: canRead(req.user, r)
    }))

    res.render('dashboard', {
      user: req.user,
      resources: resourcesWithAccess,
      error: req.query.error || null,
      warning: req.query.warning || null
    })
  } catch (err) {
    next(err)
  }
}