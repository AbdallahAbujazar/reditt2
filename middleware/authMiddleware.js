const jwt = require('jsonwebtoken');

exports.authMiddleware = function (req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = jwt.verify("JWT_SECRETs123");
    req.user = decodedToken.user;

    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
}


exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

exports.getUserIdFromToken = function (req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    const msg = 'Please log in first.';
    return res.render('home', { user: null, posts, msg: msg });
  }
  const decodedToken = jwt.decode(token, "JWT_SECRETs123");
  req.user = decodedToken.user;
  next();
}

