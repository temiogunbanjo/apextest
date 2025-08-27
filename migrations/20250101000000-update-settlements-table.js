"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Settlements", "id", {
      type: Sequelize.UUID,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.UUIDV4,
    });

    await queryInterface.addColumn("Settlements", "failureReason", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Settlements", "completedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Settlements", "failedAt", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn("Settlements", "transactionIds", {
      type: Sequelize.JSON,
      allowNull: true,
      comment: "Array of transaction IDs included in this settlement",
    });

    // Update existing records to have valid UUIDs if they don't have them
    await queryInterface.sequelize.query(`
      UPDATE Settlements 
      SET id = uuid() 
      WHERE id IS NULL OR id = ''
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Settlements", "transactionIds");
    await queryInterface.removeColumn("Settlements", "failedAt");
    await queryInterface.removeColumn("Settlements", "completedAt");
    await queryInterface.removeColumn("Settlements", "failureReason");
    await queryInterface.removeColumn("Settlements", "id");
  },
};
