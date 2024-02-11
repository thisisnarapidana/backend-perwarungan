module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define("transaction", {
    transaction_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    buyer_id: {
      type: DataTypes.STRING,
    },
    clerk_id: {
      type: DataTypes.STRING,
    },
    table_id: {
      type: DataTypes.STRING,
    },
    status: {
      type: DataTypes.STRING,
    },
  });

  return transaction;
};
