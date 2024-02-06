module.exports = (sequelize, DataTypes) => {
  const transaction = sequelize.define("transaction", {
    transaction_id: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    clerk_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    table_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return transaction;
};
