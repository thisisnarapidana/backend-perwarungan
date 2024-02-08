const db = require("../../models");
const router = require("express").Router();
const randomID = require("../../components/randomID");
const socketController = require("../../controllers/socketController");

router.post("/", async (req, res) => {
  try {
    const { table_id, items } = req.body;

    const cek = await db.table.findOne({
      where: { table_id: table_id },
    });
    if (!cek) throw new Error("meja tidak tersedia");

    await db.sequelize.sync();

    const Tid = await randomID.generateID(db.transaction);

    socketController.emitTransaction(table_id, Tid);
    const t = await db.sequelize.transaction();

    try {
      let totalPrice = 0;
      let message = "";

      await db.transaction.create(
        {
          transaction_id: Tid,
          clerk_id: "kasir",
          table_id: table_id,
        },
        { transaction: t },
      );

      for (const i of items) {
        const itemInfo = await db.item.findByPk(i[0]);
        const purchased_qty = i[1];

        if (!itemInfo) throw new Error(`Item with ID ${i[0]} not found.`);

        if (purchased_qty < 1)
          throw new Error(
            `need more than 0 to increase Item qty with ID ${i[0]} not found.`,
          );

        if (itemInfo.qty - purchased_qty < 0)
          throw new Error(
            `quantity demand cannot be met by the quantity of goods available`,
          );

        totalPrice += itemInfo.price * purchased_qty;

        const Did = await randomID.generateID(db.detailed_transaction);

        await db.detailed_transaction.create(
          {
            detailed_transaction_id: Did,
            transaction_id: Tid,
            item_id: i[0],
            qty_stock_change: purchased_qty * -1,
          },
          { transaction: t },
        );

        await db.item.update(
          { qty: db.sequelize.literal(`qty - ${purchased_qty}`) },
          { where: { item_id: i[0] }, transaction: t },
        );
      }

      //2 februari
      // await db.user.update(
      //   { balance: db.sequelize.literal(`balance + ${totalPrice}`) },
      //   { where: { user_id: req.ses.user_id }, transaction: t },
      // );

      await t.commit();

      res
        .status(200)
        .json({ message: message + "transaction created successfully." });
    } catch (error) {
      await t.rollback();
      console.error("Transaction failed:", error);
      throw error;
    } finally {
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json(error.message);
  }
});

module.exports = router;
