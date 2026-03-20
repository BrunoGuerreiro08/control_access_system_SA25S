
export const canRead = (user, resource) => {
  return user.clearanceLevel >= resource.classificationLevel;
}

export const canWrite = (user, resource) => {
  return user.clearanceLevel <= resource.classificationLevel;
}