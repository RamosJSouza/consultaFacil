import { sequelize } from '../config/database';
import * as addResetTokenToUsers from '../migrations/add-reset-token-to-users';
import * as createNotificationsTable from '../migrations/create-notifications-table';
import logger from '../utils/logger';

// Array de migrações ordenadas (pulando a migração fix-updated-at que já foi aplicada)
const migrations = [
  { name: 'add-reset-token-to-users', migration: addResetTokenToUsers },
  { name: 'create-notifications-table', migration: createNotificationsTable }
];

async function runMigrations(): Promise<void> {
  try {
    // Verifica conexão com o banco de dados
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Executa cada migração na ordem
    for (const { name, migration } of migrations) {
      try {
        logger.info(`Running migration: ${name}`);
        await migration.up(sequelize.getQueryInterface());
        logger.info(`Migration ${name} completed successfully.`);
      } catch (error: any) {
        // Verificar se o erro é devido a uma coluna que já existe
        if (error.parent && error.parent.code === '42701') {
          logger.warn(`Column already exists in migration ${name}, skipping...`);
          continue;
        }
        
        // Verificar se o erro é devido a uma tabela que já existe
        if (error.parent && error.parent.code === '42P07') {
          logger.warn(`Table already exists in migration ${name}, skipping...`);
          continue;
        }
        
        logger.error(`Error running migration ${name}:`, error);
        throw error;
      }
    }

    logger.info('All migrations completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error('Migration process failed:', error);
    process.exit(1);
  }
}

// Executa o script
runMigrations(); 