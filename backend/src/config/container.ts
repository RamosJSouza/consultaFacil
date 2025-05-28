import { SequelizeUserRepository } from '../repositories/UserRepository';
import { SequelizeAppointmentRepository } from '../repositories/AppointmentRepository';
import { SequelizeRuleRepository } from '../repositories/RuleRepository';
import { SequelizeAuditLogRepository } from '../repositories/AuditLogRepository';
import { AuthService } from '../services/AuthService';
import { AppointmentService } from '../services/AppointmentService';
import { RuleService } from '../services/RuleService';
import { EmailService } from '../services/EmailService';
import { UserRole } from '../types';
import { IUserRepository, IAppointmentRepository, IRuleRepository, IAuditLogRepository } from '../repositories/interfaces';

type ContainerServices = {
  authService: AuthService;
  appointmentService: AppointmentService;
  ruleService: RuleService;
  userRepository: IUserRepository;
  appointmentRepository: IAppointmentRepository;
  ruleRepository: IRuleRepository;
  auditLogRepository: IAuditLogRepository;
  emailService: EmailService;
};

class Container {
  private static instance: Container;
  private services: Map<keyof ContainerServices, any> = new Map();

  private constructor() {
    // Initialize repositories
    const userRepository = new SequelizeUserRepository();
    const appointmentRepository = new SequelizeAppointmentRepository();
    const ruleRepository = new SequelizeRuleRepository();
    const auditLogRepository = new SequelizeAuditLogRepository();
    const emailService = new EmailService();
    
    // Initialize rule service with proper repositories
    const ruleService = new RuleService(
      ruleRepository,
      auditLogRepository
    );

    // Initialize services
    this.services.set('authService', new AuthService(userRepository));
    this.services.set('appointmentService', new AppointmentService(appointmentRepository, ruleRepository, emailService));
    this.services.set('ruleService', ruleService);
    this.services.set('userRepository', userRepository);
    this.services.set('ruleRepository', ruleRepository);
    this.services.set('auditLogRepository', auditLogRepository);
    this.services.set('appointmentRepository', appointmentRepository);
    this.services.set('emailService', emailService);
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public get<K extends keyof ContainerServices>(serviceName: K): ContainerServices[K] {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as ContainerServices[K];
  }
}

export default Container;
