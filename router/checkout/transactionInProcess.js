const db = require("../../models");
const router = require("express").Router();
const { Op } = require("sequelize");

router.get("/", async (req, res) => {
  try {
    const get = await db.transaction.findAll({
      where: {
        status: { [Op.nt]: "selesai" },
      },
    });

    res.status(200).json({ transactions: get });
  } catch (error) {
    console.error("get transaction failed:", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
