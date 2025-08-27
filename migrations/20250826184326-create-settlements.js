"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Settlements", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      merchantId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(14, 2),
        allowNull: false,
      },
      settlementDate: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      reference: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.STRING, // "pending", "processing", "completed", "failed", "deleted"
        defaultValue: "pending",
      },
      failureReason: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      failedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      transactionIds: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Array of transaction IDs included in this settlement",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Settlements");
  },
};
