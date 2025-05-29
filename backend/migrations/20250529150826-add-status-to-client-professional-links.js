'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add status column
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

  async down (queryInterface, Sequelize) {
    // Remove the status column
    await queryInterface.removeColumn('client_professional_links', 'status');
    
    // Remove the ENUM type
    await queryInterface.sequelize.query(
      `DROP TYPE IF EXISTS enum_client_professional_links_status;`
    );
  }
};
