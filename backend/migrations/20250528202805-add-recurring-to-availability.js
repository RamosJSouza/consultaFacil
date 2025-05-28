'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Verificar se a tabela availabilities existe
    try {
      const tableInfo = await queryInterface.describeTable('availabilities');
      
      // Verificar se a coluna is_recurring já existe
      if (!tableInfo.is_recurring) {
        await queryInterface.addColumn('availabilities', 'is_recurring', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar coluna is_recurring:', error);
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      // Remover a coluna is_recurring
      await queryInterface.removeColumn('availabilities', 'is_recurring');
    } catch (error) {
      console.error('Erro ao remover coluna is_recurring:', error);
    }
  }
};
