import { ProjectEntity } from "@src/project/persist/entities/project.entity";
import { LoggerService } from "@src/shared/lib/logger";

export namespace AddUserAsOwnerLogs {

  /**
   * Registra que o proprietário do projeto foi atualizado com sucesso.
   */
  export function ownerUpdated(
    logger: LoggerService,
    requestingUserId: string,
    project: ProjectEntity,
    newOwnerId: string,
  ): void {
    logger.log(
      'Project owner successfully updated',
      {
        who: requestingUserId,
        where: 'AddUserAsOwnerService.execute',
        what: 'project_owner_changed',
        projectId: project.id,
        newOwnerId: newOwnerId,
        // Opcional: oldOwnerId: project.owner_id (se tiver o valor anterior aqui)
      }
    )
  }

  /**
   * Registra que o evento de mudança de proprietário foi despachado para o broker.
   */
  export function ownerChange(
    logger: LoggerService,
    projectId: string,
    newOwnerId: string,
  ): void {
    logger.log(
      'Project owner changed event dispatched for broker',
      {
        who: 'system_process', // Geralmente é um processo interno que despacha eventos
        where: 'AddUserAsOwnerService.execute',
        what: 'event_dispatch_success',
        why: 'owner_change_notification_sent',
        projectId: projectId,
        newOwnerId: newOwnerId,
      }
    )
  }

  /**
   * Registra que o projeto não foi encontrado para a operação de mudança de proprietário.
   * Embora o interceptor possa pegar a exceção, este log é um ponto de controle de negócio explícito.
   */
  export function projectNotFound(
    logger: LoggerService,
    requestingUserId: string,
    projectId: string,
    userEmail: string,
  ): void {
    logger.error(
      'Project not found for ownership change',
      {
        who: requestingUserId,
        where: 'AddUserAsOwnerService.execute',
        why: 'project_id_not_found',
        projectId: projectId,
        userEmail: userEmail,
      }
    )
  }

  /**
   * Registra uma violação de política ao tentar mudar o proprietário do projeto.
   */
  export function forbiddenStatusChange(
    logger: LoggerService,
    projectStatus: string,
    requestingUserId: string
  ): void {
    logger.warn(
      'Attempt to change owner for project with forbidden status',
      {
        who: requestingUserId,
        where: 'AddUserAsOwnerService.ensureStatusAllowsOwnershipChange',
        what: 'owner_change_forbidden_by_status',
        why: 'project_status_conflict',
        projectStatus: projectStatus,
      }
    )
  }
}