export enum MemberRole {
  /**
   * Represents the primary owner of the organization, with full control.
   */
  OWNER = 'owner',

  /**
   * Represents an administrator with broad management permissions.
   */
  ADMIN = 'admin',

  /**
   * Represents a standard member with general access and participation rights.
   */
  MEMBER = 'member',

  /**
   * Represents a guest user with limited, often read-only, access.
   */
  GUEST = 'guest',
}