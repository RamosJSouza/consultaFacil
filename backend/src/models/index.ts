import User from './User';
import Appointment from './Appointment';
import Availability from './Availability';
import ClientProfessionalLink from './ClientProfessionalLink';
import { sequelize } from '../config/database';

// Configurar associações
User.hasMany(Availability, {
  foreignKey: 'professionalId',
  as: 'availabilities',
  onDelete: 'CASCADE',
});

Availability.belongsTo(User, {
  foreignKey: 'professionalId',
  as: 'professional',
});

// Associações para agendamentos
User.hasMany(Appointment, {
  foreignKey: 'clientId',
  as: 'clientAppointments',
});

User.hasMany(Appointment, {
  foreignKey: 'professionalId',
  as: 'professionalAppointments',
});

Appointment.belongsTo(User, {
  foreignKey: 'clientId',
  as: 'client',
});

Appointment.belongsTo(User, {
  foreignKey: 'professionalId',
  as: 'professional',
});

// Associações para vínculos cliente-profissional
User.hasMany(ClientProfessionalLink, {
  foreignKey: 'clientId',
  as: 'clientLinks',
});

User.hasMany(ClientProfessionalLink, {
  foreignKey: 'professionalId',
  as: 'professionalLinks',
});

ClientProfessionalLink.belongsTo(User, {
  foreignKey: 'clientId',
  as: 'client',
});

ClientProfessionalLink.belongsTo(User, {
  foreignKey: 'professionalId',
  as: 'professional',
});

export {
  User,
  Appointment,
  Availability,
  ClientProfessionalLink,
  sequelize,
};

export default {
  User,
  Appointment,
  Availability,
  ClientProfessionalLink,
  sequelize,
}; 