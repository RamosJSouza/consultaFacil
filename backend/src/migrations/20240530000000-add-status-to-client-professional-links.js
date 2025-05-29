'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('client_professional_links', 'status', {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    });

    // Update existing records to have 'approved' status
    await queryInterface.sequelize.query(
      `UPDATE client_professional_links SET status = 'approved'`
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('client_professional_links', 'status');
  }
}; 