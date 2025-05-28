import { QueryInterface, DataTypes } from 'sequelize';

async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    // Adicionar coluna reset_token
    await queryInterface.addColumn('users', 'reset_token', {
      type: DataTypes.STRING,
      allowNull: true
    });

    // Adicionar coluna reset_token_expiry
    await queryInterface.addColumn('users', 'reset_token_expiry', {
      type: DataTypes.DATE,
      allowNull: true
    });

    console.log('Migration add-reset-token-to-users: successfully added columns');
  } catch (error) {
    console.error('Migration add-reset-token-to-users failed:', error);
    throw error;
  }
}

async function down(queryInterface: QueryInterface): Promise<void> {
  try {
    // Remover as colunas em caso de rollback
    await queryInterface.removeColumn('users', 'reset_token');
    await queryInterface.removeColumn('users', 'reset_token_expiry');
    
    console.log('Migration add-reset-token-to-users: successfully reverted');
  } catch (error) {
    console.error('Migration add-reset-token-to-users rollback failed:', error);
    throw error;
  }
}

export { up, down }; 