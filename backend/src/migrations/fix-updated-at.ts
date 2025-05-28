import { QueryInterface, DataTypes } from 'sequelize';

async function up(queryInterface: QueryInterface): Promise<void> {
  try {
    // Step 1: Add the column as nullable first
    await queryInterface.addColumn('users', 'updated_at', {
      type: DataTypes.DATE,
      allowNull: true
    });

    // Step 2: Update existing records
    await queryInterface.sequelize.query(`
      UPDATE users 
      SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP) 
      WHERE updated_at IS NULL
    `);

    // Step 3: Make the column non-nullable
    await queryInterface.changeColumn('users', 'updated_at', {
      type: DataTypes.DATE,
      allowNull: false
    });

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('users', 'updated_at');
}

export { up, down }; 