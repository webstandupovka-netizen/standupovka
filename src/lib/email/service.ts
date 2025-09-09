import { render } from '@react-email/render'
import { PaymentSuccessEmail } from '@/emails/payment-success-email'
import { MagicLinkEmail } from '@/emails/magic-link-email'
import { supabaseServer } from '@/lib/database/client'
import nodemailer from 'nodemailer'

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
      console.error('Resend API key not configured')
      throw new Error('Resend API key not configured')
    }

    console.log('Sending email via Resend API to:', to)
    
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

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Resend API error:', response.status, errorText)
      return false
    }

    const result = await response.json()
    console.log('Email sent successfully via Resend:', result.id)
    return true
  }

  private async sendWithNodemailer({ to, subject, html }: { to: string; subject: string; html: string }): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.resend.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        requireTLS: true,
         auth: {
          user: process.env.SMTP_USER || 'resend',
          pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY
        }
      })

      const info = await transporter.sendMail({
        from: this.config.from,
        to,
        subject,
        html
      })

      console.log('Email sent via SMTP:', info.messageId)
      return true
    } catch (error) {
      console.error('SMTP sending failed:', error)
      return false
    }
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

  async sendMagicLinkEmail({
    userEmail,
    magicLink,
    expiresIn = '15 минут',
    userId
  }: {
    userEmail: string
    magicLink: string
    expiresIn?: string
    userId?: string
  }): Promise<boolean> {
    const html = await render(MagicLinkEmail({
      userEmail,
      magicLink,
      expiresIn,
      supportEmail: 'support@standupovka.md'
    }))

    return this.sendEmail({
      to: userEmail,
      subject: '🔐 Ваша ссылка для входа в Standup',
      html,
      userId,
      emailType: 'magic_link'
    })
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