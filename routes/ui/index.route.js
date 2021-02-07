const router = require("express").Router();

router.get("/signup", (req, res, next) => {
  return res.render("signup", { layout: false });
});
router.get("/requestForgotPassword", (req, res, next) => {
  return res.render("requestForgotPassword", { layout: false });
});
router.get("/resetPassword", (req, res, next) => {
  return res.render("resetPassword", { layout: false });
});

module.exports = router;
