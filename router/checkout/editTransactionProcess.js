const db = require("../../models");
const router = require("express").Router();
const socketController = require("../../controllers/socketController");

router.put("/", async (req, res) => {
  try {
    const { transaction_id } = req.body;

    const cek = await db.transaction.findOne({
      where: { transaction_id: transaction_id },
    });
    if (!cek) throw new Error("transaksi tidak tersedia");

    if (cek.dataValues.status === 33)
      throw new Error("transaksi sudah berakhir");

    await db.transaction.update(
      {
        status: db.sequelize.literal(`status + ${11}`),
      },
      {
        where: { transaction_id: transaction_id },
      },
    );

    socketController.emitFollowUp(cek.dataValues.buyer_id);

    res.status(200).json({ message: "follow up transaction successfully." });
  } catch (error) {
    console.error("update transaction failed:", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
