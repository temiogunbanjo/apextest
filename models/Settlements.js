"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Settlements extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Settlements.belongsTo(models.Merchants, { foreignKey: "merchantId" });
    }
  }
  Settlements.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      merchantId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.DECIMAL(14, 2),
        allowNull: false,
      },
      settlementDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      reference: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING, // "pending", "processing", "completed", "failed", "deleted"
        defaultValue: "pending",
      },
      failureReason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      failedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      transactionIds: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Array of transaction IDs included in this settlement",
      },
    },
    {
      sequelize,
      modelName: "Settlements",
      freezeTableName: true,
    }
  );

  // (async () => {
  //   await sequelize.sync({ force: true }); // drops & recreates tables
  //   console.log("Database synced!");
  // })();

  return Settlements;
};
