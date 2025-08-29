import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PostHog } from 'posthog-node'
import { ConfigService } from '@src/shared/config/service/config.service'

@Injectable()
export class FeatureFlagService implements OnModuleInit, OnModuleDestroy {
  private posthog: PostHog

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const posthogConfig = this.config.get('posthog')
    this.posthog = new PostHog(posthogConfig.api_key, {
      host: posthogConfig.host,
    })
  }

  onModuleDestroy() {
    if (this.posthog) {
      this.posthog.shutdown()
    }
  }

  async isEnabled(flag: string, distinctId?: string, properties?: Record<string, any>): Promise<boolean> {
    if (!this.posthog) {
      return false
    }

    try {
      return await this.posthog.isFeatureEnabled(flag, distinctId || 'anonymous', properties)
    } catch (error) {
      console.error(`Error checking feature flag ${flag}:`, error)
      return false
    }
  }

  async isEnabledForUser(flag: string, userId: string, userProperties?: Record<string, any>): Promise<boolean> {
    return this.isEnabled(flag, userId, userProperties)
  }

  async isEnabledForOrganization(flag: string, organizationId: string, orgProperties?: Record<string, any>): Promise<boolean> {
    return this.isEnabled(flag, organizationId, orgProperties)
  }

  async getAllFlags(distinctId?: string, properties?: Record<string, any>): Promise<Record<string, boolean | string>> {
    if (!this.posthog) {
      return {}
    }

    try {
      return await this.posthog.getAllFlags(distinctId || 'anonymous', properties)
    } catch (error) {
      console.error('Error getting all feature flags:', error)
      return {}
    }
  }

  // Method to track events related to feature flag usage
  trackFeatureFlagUsage(flag: string, userId: string, enabled: boolean, properties?: Record<string, any>) {
    if (this.posthog) {
      this.posthog.capture({
        distinctId: userId,
        event: 'feature_flag_used',
        properties: {
          flag_name: flag,
          flag_enabled: enabled,
          ...properties
        }
      })
    }
  }
}
