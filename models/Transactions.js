"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Transactions.belongsTo(models.Merchants, { foreignKey: "merchantId" });
      // Transactions.hasOne(models.Dispute, { foreignKey: "transactionId" });
    }
  }

  Transactions.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uniqueId: {
        type: DataTypes.UUID,
        unique: true,
        allowNull: false,
      },
      merchantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: {
        type: DataTypes.DECIMAL(16, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "NGN",
      },
      cardPanMasked: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      authCode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      processorRef: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      network: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      acquirer: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      settledAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      transactionStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      sequelize,
      modelName: "Transactions",
      freezeTableName: true,
    }
  );

  // (async () => {
  //   await sequelize.sync({ force: true }); // drops & recreates tables
  //   console.log("Database synced!");
  // })();

  return Transactions;
};
