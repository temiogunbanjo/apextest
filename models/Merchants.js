"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Merchants extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Merchants.hasMany(models.Transactions, { foreignKey: "merchantId" });
      // Merchants.hasMany(models.Settlement, { foreignKey: "merchantId" });
    }
  }

  Merchants.init(
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      bankAccountNumber: {
        type: DataTypes.STRING,
        allowNull: true
      },
      bankName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      settlementCurrency: {
        type: DataTypes.STRING,
        defaultValue: "NGN"
      },
    },
    {
      sequelize,
      modelName: "Merchants",
      freezeTableName: true,
    }
  );

  // (async () => {
  //   console.log("Syncing database...");
  //   await sequelize.sync({ force: true }); // drops & recreates tables
  //   console.log("Database synced!");
  // })();

  return Merchants;
};
