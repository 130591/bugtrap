import { Injectable, LoggerService } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { ProjectCreatedEvent } from '../project.events'

// Mock interfaces - replace with actual implementations
interface EmailService {
  sendWelcomeEmail(ownerId: string, projectName: string): Promise<void>
}

interface NotificationService {
  notifyTeam(projectId: string, message: string): Promise<void>
}

interface PermissionService {
  createDefaultPermissions(projectId: string, ownerId: string): Promise<void>
}

@Injectable()
export class ProjectCreatedEventHandler {
  constructor(
    private readonly emailService: EmailService,
    private readonly notificationService: NotificationService,
    private readonly permissionService: PermissionService,
    private readonly logger: LoggerService,
  ) {}

  // @OnDomainEvent('project.created') - This would be implemented with actual event bus
  async handle(event: ProjectCreatedEvent): Promise<void> {
    const correlationId = randomUUID()

    this.logger.log('Processing project created event', {
      who: 'system_process',
      where: 'ProjectCreatedEventHandler.handle',
      what: 'event_processing_started',
      eventId: event.eventId,
      projectId: event.aggregateId,
      correlationId
    })

    try {
      // Execute side effects in parallel
      await Promise.allSettled([
        this.sendWelcomeEmail(event),
        this.createDefaultPermissions(event),
        this.notifyTeam(event)
      ])

      this.logger.log('Project created event processed successfully', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.handle',
        what: 'event_processing_completed',
        eventId: event.eventId,
        correlationId
      })
    } catch (error) {
      this.logger.error('Failed to process project created event', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.handle',
        what: 'event_processing_failed',
        why: error.message,
        eventId: event.eventId,
        correlationId
      })
      // Don't rethrow - let event bus handle retries
    }
  }

  private async sendWelcomeEmail(event: ProjectCreatedEvent): Promise<void> {
    try {
      await this.emailService.sendWelcomeEmail(event.ownerId, event.projectName)
      
      this.logger.log('Welcome email sent', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.sendWelcomeEmail',
        what: 'welcome_email_sent',
        projectId: event.aggregateId,
        ownerId: event.ownerId
      })
    } catch (error) {
      this.logger.error('Failed to send welcome email', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.sendWelcomeEmail',
        what: 'welcome_email_failed',
        why: error.message,
        projectId: event.aggregateId,
        ownerId: event.ownerId
      })
    }
  }

  private async createDefaultPermissions(event: ProjectCreatedEvent): Promise<void> {
    try {
      await this.permissionService.createDefaultPermissions(event.aggregateId, event.ownerId)
      
      this.logger.log('Default permissions created', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.createDefaultPermissions',
        what: 'default_permissions_created',
        projectId: event.aggregateId,
        ownerId: event.ownerId
      })
    } catch (error) {
      this.logger.error('Failed to create default permissions', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.createDefaultPermissions',
        what: 'default_permissions_failed',
        why: error.message,
        projectId: event.aggregateId,
        ownerId: event.ownerId
      })
    }
  }

  private async notifyTeam(event: ProjectCreatedEvent): Promise<void> {
    try {
      const message = `New project "${event.projectName}" has been created`
      await this.notificationService.notifyTeam(event.aggregateId, message)
      
      this.logger.log('Team notification sent', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.notifyTeam',
        what: 'team_notification_sent',
        projectId: event.aggregateId,
        projectName: event.projectName
      })
    } catch (error) {
      this.logger.error('Failed to notify team', {
        who: 'system_process',
        where: 'ProjectCreatedEventHandler.notifyTeam',
        what: 'team_notification_failed',
        why: error.message,
        projectId: event.aggregateId
      })
    }
  }
}
