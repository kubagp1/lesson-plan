module.exports = (req, res, next) => {
  res.header('Lesson-Plan-API', true)
  res.header('Access-Control-Expose-Headers', '*')
  next()
}