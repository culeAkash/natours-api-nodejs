// Global error handling middleware
module.exports = (err, req, res, next) => {

  console.log(err.stack);

  const statusCode = err?.statusCode || 500;
  const status = err?.status || 'error';

  res.status(statusCode).json({
    status: status,
    message: err.message ? err.message : "Something went wrong"
  })
}