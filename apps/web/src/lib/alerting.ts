import * as Sentry from '@sentry/nextjs'
import { getConfig } from './config/environment'

export interface AlertConfig {
  webhookUrl?: string
  slackChannel?: string
  emailRecipients?: string[]
  discordWebhook?: string
}

export interface Alert {
  id: string
  type: 'error' | 'warning' | 'info' | 'critical'
  title: string
  message: string
  source: string
  timestamp: Date
  metadata?: Record<string, any>
}

class AlertManager {
  private config: AlertConfig = {}
  private alerts: Alert[] = []
  private readonly maxAlerts = 1000

  configure(config: AlertConfig) {
    this.config = config
  }

  async sendAlert(alert: Omit<Alert, 'id' | 'timestamp'>) {
    const fullAlert: Alert = {
      ...alert,
      id: this.generateId(),
      timestamp: new Date()
    }

    // Store locally
    this.alerts.unshift(fullAlert)
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(0, this.maxAlerts)
    }

    // Send to Sentry
    if (alert.type === 'error' || alert.type === 'critical') {
      Sentry.captureMessage(alert.message, {
        level: alert.type === 'critical' ? 'fatal' : 'error',
        tags: {
          source: alert.source,
          type: alert.type
        },
        extra: alert.metadata
      })
    }

    // Send to external services
    await this.notifyExternalServices(fullAlert)

    return fullAlert
  }

  private async notifyExternalServices(alert: Alert) {
    const promises: Promise<void>[] = []

    // Webhook notification
    if (this.config.webhookUrl) {
      promises.push(this.sendWebhook(alert))
    }

    // Slack notification
    if (this.config.slackChannel) {
      promises.push(this.sendSlackMessage(alert))
    }

    // Discord notification  
    if (this.config.discordWebhook) {
      promises.push(this.sendDiscordMessage(alert))
    }

    // Email notification
    if (this.config.emailRecipients?.length) {
      promises.push(this.sendEmailAlert(alert))
    }

    // Don't wait for all notifications to complete
    await Promise.allSettled(promises)
  }

  private async sendWebhook(alert: Alert) {
    try {
      if (!this.config.webhookUrl) return

      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alert_type: alert.type,
          title: alert.title,
          message: alert.message,
          source: alert.source,
          timestamp: alert.timestamp.toISOString(),
          metadata: alert.metadata
        })
      })
    } catch (error) {
      console.error('Failed to send webhook alert:', error)
    }
  }

  private async sendSlackMessage(alert: Alert) {
    try {
      if (!this.config.webhookUrl) return

      const color = this.getAlertColor(alert.type)
      const payload = {
        channel: this.config.slackChannel,
        username: 'Crops.AI Monitor',
        icon_emoji: this.getAlertEmoji(alert.type),
        attachments: [{
          color,
          title: alert.title,
          text: alert.message,
          fields: [
            { title: 'Source', value: alert.source, short: true },
            { title: 'Type', value: alert.type.toUpperCase(), short: true },
            { title: 'Time', value: alert.timestamp.toISOString(), short: false }
          ]
        }]
      }

      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Failed to send Slack alert:', error)
    }
  }

  private async sendDiscordMessage(alert: Alert) {
    try {
      if (!this.config.discordWebhook) return

      const color = this.getDiscordColor(alert.type)
      const payload = {
        embeds: [{
          title: alert.title,
          description: alert.message,
          color,
          fields: [
            { name: 'Source', value: alert.source, inline: true },
            { name: 'Type', value: alert.type.toUpperCase(), inline: true },
            { name: 'Time', value: alert.timestamp.toISOString(), inline: false }
          ],
          timestamp: alert.timestamp.toISOString()
        }]
      }

      await fetch(this.config.discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Failed to send Discord alert:', error)
    }
  }

  private async sendEmailAlert(alert: Alert) {
    try {
      // This would integrate with your email service (Resend, SendGrid, etc.)
      // For now, just log that an email would be sent

    } catch (error) {
      console.error('Failed to send email alert:', error)
    }
  }

  private getAlertColor(type: Alert['type']): string {
    switch (type) {
      case 'critical': return 'danger'
      case 'error': return 'warning' 
      case 'warning': return '#ffcc00'
      case 'info': return 'good'
      default: return '#cccccc'
    }
  }

  private getDiscordColor(type: Alert['type']): number {
    switch (type) {
      case 'critical': return 0xff0000 // Red
      case 'error': return 0xff6600   // Orange
      case 'warning': return 0xffcc00 // Yellow
      case 'info': return 0x00ff00    // Green
      default: return 0xcccccc        // Gray
    }
  }

  private getAlertEmoji(type: Alert['type']): string {
    switch (type) {
      case 'critical': return ':fire:'
      case 'error': return ':x:'
      case 'warning': return ':warning:'
      case 'info': return ':information_source:'
      default: return ':question:'
    }
  }

  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  getRecentAlerts(limit = 50): Alert[] {
    return this.alerts.slice(0, limit)
  }

  getAlertsByType(type: Alert['type'], limit = 50): Alert[] {
    return this.alerts.filter(alert => alert.type === type).slice(0, limit)
  }

  clearAlerts(): void {
    this.alerts = []
  }
}

// Global alert manager instance
export const alertManager = new AlertManager()

// Initialize with environment variables
alertManager.configure({
  webhookUrl: getConfig().ALERT_WEBHOOK_URL,
  slackChannel: getConfig().SLACK_CHANNEL,
  emailRecipients: getConfig().ALERT_EMAIL_RECIPIENTS?.split(','),
  discordWebhook: getConfig().DISCORD_WEBHOOK_URL
})

// Convenience functions
export async function sendCriticalAlert(title: string, message: string, source: string, metadata?: Record<string, any>) {
  return alertManager.sendAlert({ type: 'critical', title, message, source, metadata })
}

export async function sendErrorAlert(title: string, message: string, source: string, metadata?: Record<string, any>) {
  return alertManager.sendAlert({ type: 'error', title, message, source, metadata })
}

export async function sendWarningAlert(title: string, message: string, source: string, metadata?: Record<string, any>) {
  return alertManager.sendAlert({ type: 'warning', title, message, source, metadata })
}

export async function sendInfoAlert(title: string, message: string, source: string, metadata?: Record<string, any>) {
  return alertManager.sendAlert({ type: 'info', title, message, source, metadata })
}