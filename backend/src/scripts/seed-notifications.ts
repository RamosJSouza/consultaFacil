import { sequelize } from '../config/database';
import User from '../models/User';
import Notification from '../models/Notification';
import logger from '../utils/logger';
import { UserRole } from '../types';

async function seedNotifications(): Promise<void> {
  try {
    // Verificar conexão com o banco de dados
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // Encontrar usuários existentes para criar notificações
    const users = await User.findAll({
      where: {
        isActive: true
      },
      limit: 5 // Limitar para não criar muitos dados de teste
    });

    if (users.length === 0) {
      logger.info('No active users found. Creating a test user...');
      
      // Criar um usuário de teste se não existir nenhum
      const testUser = await User.create({
        name: 'Usuário de Teste',
        email: 'teste@consultafacil.com',
        password: 'senha123', // Será hasheada automaticamente pelo hook
        role: UserRole.CLIENT,
        isActive: true
      });
      
      users.push(testUser);
      logger.info(`Created test user with ID: ${testUser.id}`);
    }

    // Mensagens de exemplo para notificações
    const notificationMessages = [
      'Bem-vindo ao ConsultaFácil! Seu cadastro foi concluído com sucesso.',
      'Você tem uma consulta agendada para amanhã às 14:00.',
      'Uma consulta foi cancelada pelo profissional.',
      'Seu horário foi confirmado com sucesso!',
      'Lembrete: Você tem uma consulta em 1 hora.',
      'Profissional alterou o horário da sua consulta.',
      'Consulta reagendada com sucesso!',
      'Nova mensagem recebida de Dr. Silva.',
      'Sua avaliação foi registrada. Obrigado pelo feedback!',
      'Precisamos confirmar alguns dados. Entre em contato conosco.'
    ];

    // Limpar notificações existentes
    await Notification.destroy({ 
      where: {},
      truncate: true,
      cascade: true,
      restartIdentity: true
    });
    logger.info('Cleared existing notifications.');

    // Criar notificações para cada usuário
    const createdNotifications = [];
    for (const user of users) {
      // Selecionar aleatoriamente entre 3 e 6 mensagens para cada usuário
      const messagesToCreate = Math.floor(Math.random() * 4) + 3;
      
      for (let i = 0; i < messagesToCreate; i++) {
        const messageIndex = Math.floor(Math.random() * notificationMessages.length);
        const isRead = Math.random() > 0.6; // 40% chance de ser não lida
        
        const notification = await Notification.create({
          userId: user.id,
          message: notificationMessages[messageIndex],
          isRead
        });
        
        createdNotifications.push(notification);
      }
    }

    logger.info(`Created ${createdNotifications.length} notifications for ${users.length} users.`);
    logger.info('Notification seeding completed successfully.');
    
    process.exit(0);
  } catch (error) {
    logger.error('Notification seeding failed:', error);
    process.exit(1);
  }
}

// Executar o script
seedNotifications(); 