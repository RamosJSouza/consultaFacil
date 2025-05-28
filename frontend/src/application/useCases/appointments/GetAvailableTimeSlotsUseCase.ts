import { format, addMinutes, isAfter, isBefore, parseISO } from 'date-fns';
import type { Availability } from '../../../domain/entities/Availability';
import type { AppointmentRepository } from '../../../domain/repositories/AppointmentRepository';
import type { AvailabilityRepository } from '../../../domain/repositories/AvailabilityRepository';

export class GetAvailableTimeSlotsUseCase {
  private availabilityRepository: AvailabilityRepository;
  private appointmentRepository: AppointmentRepository;

  constructor(
    availabilityRepository: AvailabilityRepository,
    appointmentRepository: AppointmentRepository
  ) {
    this.availabilityRepository = availabilityRepository;
    this.appointmentRepository = appointmentRepository;
  }

  async execute(professionalId: number, date: Date): Promise<string[]> {
    // Get day of week (0-6, Sunday to Saturday)
    const dayOfWeek = date.getDay();
    
    // Format date as YYYY-MM-DD
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // 1. Get all availabilities for the professional for this day of week
    const availabilities = await this.availabilityRepository.getByProfessionalAndDay(
      professionalId, 
      dayOfWeek
    );
    
    if (!availabilities.length) {
      return [];
    }
    
    // 2. Get all appointments for the professional on the selected date
    const appointments = await this.appointmentRepository.getByProfessionalAndDate(
      professionalId,
      formattedDate
    );
    
    // 3. Generate available time slots based on availabilities and booked appointments
    const availableTimeSlots: string[] = [];
    
    for (const availability of availabilities) {
      // Verificar se é uma disponibilidade única ou recorrente
      // Se não for recorrente (isRecurring = false), verificar se a data selecionada é igual à data da disponibilidade
      if (!availability.isRecurring) {
        // Se a disponibilidade não se repete, verificar se a data selecionada é igual à data da criação
        // Usando o createdAt para comparar a semana da criação
        const availabilityDate = new Date(availability.createdAt);
        const availabilityDayOfWeek = availabilityDate.getDay();
        
        // Se o dia da semana na data de criação da disponibilidade for diferente do dia da semana selecionado,
        // ajustar para encontrar a data correta em que essa disponibilidade foi criada
        if (availabilityDayOfWeek !== dayOfWeek) {
          // Se não for o mesmo dia da semana da criação, pular esta disponibilidade
          continue;
        }
        
        // Se for mais de uma semana depois da criação, pular (já que não é recorrente)
        const currentDate = new Date(date);
        const dayDifference = Math.floor((currentDate.getTime() - availabilityDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dayDifference > 7) {
          continue;
        }
      }
      
      // Parse availability times
      const [startHour, startMinute] = availability.startTime.split(':').map(Number);
      const [endHour, endMinute] = availability.endTime.split(':').map(Number);
      
      // Create start and end times for the selected date
      const startDateTime = new Date(date);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(date);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      // Generate 30-minute time slots
      let currentSlot = startDateTime;
      
      while (isBefore(currentSlot, endDateTime) || format(currentSlot, 'HH:mm') === format(endDateTime, 'HH:mm')) {
        // Check if this time slot overlaps with any appointment
        const formattedTimeSlot = format(currentSlot, 'HH:mm');
        const nextSlot = addMinutes(currentSlot, 30);
        
        const isSlotAvailable = !appointments.some(appointment => {
          const appointmentStart = parseISO(`${formattedDate}T${appointment.startTime}`);
          const appointmentEnd = parseISO(`${formattedDate}T${appointment.endTime}`);
          
          return (
            (isAfter(currentSlot, appointmentStart) || format(currentSlot, 'HH:mm') === format(appointmentStart, 'HH:mm')) && 
            isBefore(currentSlot, appointmentEnd)
          ) || (
            isAfter(nextSlot, appointmentStart) && 
            (isBefore(nextSlot, appointmentEnd) || format(nextSlot, 'HH:mm') === format(appointmentEnd, 'HH:mm'))
          ) || (
            (isBefore(currentSlot, appointmentStart) || format(currentSlot, 'HH:mm') === format(appointmentStart, 'HH:mm')) && 
            (isAfter(nextSlot, appointmentEnd) || format(nextSlot, 'HH:mm') === format(appointmentEnd, 'HH:mm'))
          );
        });
        
        if (isSlotAvailable) {
          availableTimeSlots.push(formattedTimeSlot);
        }
        
        // Move to the next slot
        currentSlot = nextSlot;
        
        // Break if we've reached or passed the end time
        if (format(currentSlot, 'HH:mm') === format(endDateTime, 'HH:mm') || 
            isAfter(currentSlot, endDateTime)) {
          break;
        }
      }
    }
    
    return availableTimeSlots.sort();
  }
} 