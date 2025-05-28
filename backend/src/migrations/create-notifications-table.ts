import { QueryInterface, DataTypes } from 'sequelize';

async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    await queryInterface.createTable('notifications', {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });

    // Criar índice para melhorar a performance das consultas por usuário
    await queryInterface.addIndex('notifications', ['user_id']);
    
    console.log('Migration create-notifications-table: successfully created table and index');
  } catch (error) {
    console.error('Migration create-notifications-table failed:', error);
    throw error;
  }
}

async function down(queryInterface: QueryInterface): Promise<void> {
  try {
    await queryInterface.dropTable('notifications');
    
    console.log('Migration create-notifications-table: successfully reverted');
  } catch (error) {
    console.error('Migration create-notifications-table rollback failed:', error);
    throw error;
  }
}

export { up, down }; 