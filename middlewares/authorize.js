const jwt = require('jsonwebtoken')

module.exports = function authorize(req, res, next) {
  const token = req.header('Authorization')
  if (!token) return res.status(401).send('Access denied! No token found');

  try {
    const decoded = jwt.verify(token.split(' ')[1].trim(), process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).send('Something went wrong! ' + err.message);
  }

}