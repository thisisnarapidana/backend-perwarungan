const db = require("../../models");
const router = require("express").Router();
const socketController = require("../../controllers/socketController");

router.put("/", async (req, res) => {
  try {
    const { transaction_id, status } = req.body;

    const cek = await db.transaction.findOne({
      where: { transaction_id: transaction_id },
    });
    if (!cek) throw new Error("transaksi tidak tersedia");

    await db.transaction.update(
      {
        status: status,
      },
      { transaction_id: transaction_id },
    );

    socketController.emitTransaction(Tid);

    res
      .status(200)
      .json({ message: message + "update transaction successfully." });
  } catch (error) {
    console.error("update transaction failed:", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
