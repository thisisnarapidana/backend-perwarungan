const router = require("express").Router();

router.post("/", async (req, res) => {
  return res.status(200).json({ success: true, role: req.ses.user.role });
});

module.exports = router;
