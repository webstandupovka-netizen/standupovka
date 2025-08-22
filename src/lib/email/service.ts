import { render } from '@react-email/render'
import { PaymentSuccessEmail } from '@/emails/payment-success-email'
import { supabaseServer } from '@/lib/database/client'

interface EmailServiceConfig {
  provider: 'resend' | 'nodemailer' | 'console'
  apiKey?: string
  from: string
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  userId?: string
  emailType: string
}

class EmailService {
  private config: EmailServiceConfig

  constructor() {
    this.config = {
      provider: (process.env.EMAIL_PROVIDER as 'resend' | 'nodemailer' | 'console') || 'console',
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || 'noreply@standupovka.md'
    }
  }

  async sendEmail({ to, subject, html, userId, emailType }: SendEmailParams): Promise<boolean> {
    try {
      let success = false
      let providerId: string | undefined

      switch (this.config.provider) {
        case 'resend':
          success = await this.sendWithResend({ to, subject, html })
          break
        case 'nodemailer':
          success = await this.sendWithNodemailer({ to, subject, html })
          break
        case 'console':
        default:
          success = await this.sendWithConsole({ to, subject, html })
          break
      }

      // Логируем отправку email в базу данных
      await this.logEmail({
        userId,
        emailType,
        recipientEmail: to,
        subject,
        status: success ? 'sent' : 'failed',
        providerId
      })

      return success
    } catch (error) {
      console.error('Email sending failed:', error)
      
      // Логируем ошибку
      await this.logEmail({
        userId,
        emailType,
        recipientEmail: to,
        subject,
        status: 'failed',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      })
      
      return false
    }
  }

  private async sendWithResend({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
    if (!this.config.apiKey) {
      throw new Error('Resend API key not configured')
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.config.from,
        to: [to],
        subject,
        html
      })
    })

    return response.ok
  }

  private async sendWithNodemailer({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
    // Здесь можно добавить интеграцию с Nodemailer
    // Для примера возвращаем true
    console.log('Nodemailer not implemented yet')
    return false
  }

  private async sendWithConsole({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
    console.log('=== EMAIL SENT (CONSOLE MODE) ===')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('HTML:', html.substring(0, 200) + '...')
    console.log('=================================')
    return true
  }

  private async logEmail({
    userId,
    emailType,
    recipientEmail,
    subject,
    status,
    providerId,
    metadata = {}
  }: {
    userId?: string
    emailType: string
    recipientEmail: string
    subject?: string
    status: 'sent' | 'delivered' | 'failed' | 'bounced'
    providerId?: string
    metadata?: Record<string, any>
  }) {
    try {
      await supabaseServer
        .from('email_logs')
        .insert({
          user_id: userId,
          email_type: emailType,
          recipient_email: recipientEmail,
          subject,
          status,
          provider_id: providerId,
          metadata
        })
    } catch (error) {
      console.error('Failed to log email:', error)
    }
  }

  async sendPaymentSuccessEmail({
    userEmail,
    userFirstname,
    streamTitle,
    streamDate,
    streamTime,
    amount,
    currency,
    userId
  }: {
    userEmail: string
    userFirstname?: string
    streamTitle?: string
    streamDate?: string
    streamTime?: string
    amount?: number
    currency?: string
    userId?: string
  }): Promise<boolean> {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

    const html = await render(PaymentSuccessEmail({
      userFirstname,
      streamTitle,
      streamDate,
      streamTime,
      amount,
      currency,
      streamUrl: `${baseUrl}/stream`,
      supportEmail: 'support@standupovka.md'
    }))

    return this.sendEmail({
      to: userEmail,
      subject: `🎉 Оплата прошла успешно! Доступ к "${streamTitle || 'трансляции'}" активирован`,
      html,
      userId,
      emailType: 'payment_success'
    })
  }
}

export const emailService = new EmailService()
export default emailService