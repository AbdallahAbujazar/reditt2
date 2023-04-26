function errorMiddleware(error, req, res, next) {
    const status = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    res.status(status).send(message);
  }
  
  module.exports = errorMiddleware;
  