module.exports = (fun) => (req, res, next) => {
  fun(req, res, next).catch(err => next(err));
}