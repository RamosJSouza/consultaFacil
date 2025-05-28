'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if table exists first to avoid errors
    const tableInfo = await queryInterface.describeTable('availabilities').catch(() => null);
    if (!tableInfo) return;

    // Rename camelCase columns to snake_case if they exist
    if (tableInfo.professionalId) {
      await queryInterface.renameColumn('availabilities', 'professionalId', 'professional_id');
    }

    if (tableInfo.dayOfWeek) {
      await queryInterface.renameColumn('availabilities', 'dayOfWeek', 'day_of_week');
    }

    if (tableInfo.startTime) {
      await queryInterface.renameColumn('availabilities', 'startTime', 'start_time');
    }

    if (tableInfo.endTime) {
      await queryInterface.renameColumn('availabilities', 'endTime', 'end_time');
    }

    if (tableInfo.isAvailable) {
      await queryInterface.renameColumn('availabilities', 'isAvailable', 'is_available');
    }

    if (tableInfo.createdAt) {
      await queryInterface.renameColumn('availabilities', 'createdAt', 'created_at');
    }

    if (tableInfo.updatedAt) {
      await queryInterface.renameColumn('availabilities', 'updatedAt', 'updated_at');
    }
  },

  async down (queryInterface, Sequelize) {
    // Check if table exists first to avoid errors
    const tableInfo = await queryInterface.describeTable('availabilities').catch(() => null);
    if (!tableInfo) return;

    // Rename snake_case columns back to camelCase if they exist
    if (tableInfo.professional_id) {
      await queryInterface.renameColumn('availabilities', 'professional_id', 'professionalId');
    }

    if (tableInfo.day_of_week) {
      await queryInterface.renameColumn('availabilities', 'day_of_week', 'dayOfWeek');
    }

    if (tableInfo.start_time) {
      await queryInterface.renameColumn('availabilities', 'start_time', 'startTime');
    }

    if (tableInfo.end_time) {
      await queryInterface.renameColumn('availabilities', 'end_time', 'endTime');
    }

    if (tableInfo.is_available) {
      await queryInterface.renameColumn('availabilities', 'is_available', 'isAvailable');
    }

    if (tableInfo.created_at) {
      await queryInterface.renameColumn('availabilities', 'created_at', 'createdAt');
    }

    if (tableInfo.updated_at) {
      await queryInterface.renameColumn('availabilities', 'updated_at', 'updatedAt');
    }
  }
};
