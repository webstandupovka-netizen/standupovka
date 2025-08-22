import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface PaymentSuccessEmailProps {
  userFirstname?: string
  streamTitle?: string
  streamDate?: string
  streamTime?: string
  amount?: number
  currency?: string
  streamUrl?: string
  supportEmail?: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

export const PaymentSuccessEmail = ({
  userFirstname = 'Пользователь',
  streamTitle = 'Стендап Вечер',
  streamDate = '21 сентября 2025',
  streamTime = '20:00',
  amount = 150,
  currency = 'MDL',
  streamUrl = `${baseUrl}/stream`,
  supportEmail = 'support@standupovka.md',
}: PaymentSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Оплата прошла успешно! Ваш доступ к трансляции активирован.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="120"
              height="36"
              alt="StandUp MD"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>🎉 Оплата прошла успешно!</Heading>
          
          <Text style={heroText}>
            Привет, {userFirstname}! Ваша оплата успешно обработана, и доступ к трансляции активирован.
          </Text>
          
          <Section style={eventBox}>
            <Heading style={eventTitle}>{streamTitle}</Heading>
            <Text style={eventDetails}>
              📅 Дата: {streamDate}<br/>
              🕐 Время: {streamTime}<br/>
              💰 Оплачено: {amount} {currency}
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button href={streamUrl} style={button}>
              Смотреть трансляцию
            </Button>
          </Section>
          
          <Text style={paragraph}>
            Ваш доступ к трансляции активирован и будет доступен на одном устройстве одновременно.
            Ссылка для просмотра:
          </Text>
          
          <Section style={linkBox}>
            <Link href={streamUrl} style={linkText}>
              {streamUrl}
            </Link>
          </Section>
          
          <Section style={instructionsBox}>
            <Heading style={instructionsTitle}>📋 Инструкции по просмотру:</Heading>
            <ul style={instructionsList}>
              <li style={instructionItem}>Войдите в свой аккаунт на сайте</li>
              <li style={instructionItem}>Перейдите по ссылке выше или нажмите кнопку "Смотреть трансляцию"</li>
              <li style={instructionItem}>Трансляция будет доступна только на одном устройстве</li>
              <li style={instructionItem}>Запись будет доступна в течение 7 дней после мероприятия</li>
            </ul>
          </Section>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Важно:</strong> Доступ привязан к вашему устройству. При попытке просмотра с другого устройства, 
              текущая сессия будет завершена.
            </Text>
          </Section>
          
          <Text style={paragraph}>
            Если у вас возникли вопросы или проблемы с доступом, 
            свяжитесь с нашей службой поддержки: <Link href={`mailto:${supportEmail}`} style={link}>{supportEmail}</Link>
          </Text>
          
          <Section style={footer}>
            <Text style={footerText}>
              Это письмо было отправлено автоматически. Пожалуйста, не отвечайте на него.
            </Text>
            <Text style={footerText}>
              © 2024 StandUp MD. Все права защищены.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default PaymentSuccessEmail

// Стили
const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const logoContainer = {
  marginTop: '32px',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
}

const heroText = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const eventBox = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '8px',
  margin: '24px 0',
  padding: '24px',
  textAlign: 'center' as const,
}

const eventTitle = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const eventDetails = {
  color: '#ffffff',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const buttonContainer = {
  margin: '32px auto',
  textAlign: 'center' as const,
  width: 'auto',
}

const button = {
  backgroundColor: '#f59e0b',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '240px',
  padding: '16px 24px',
  margin: '0 auto',
}

const paragraph = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const linkBox = {
  background: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
  margin: '16px 0',
  padding: '12px',
  textAlign: 'center' as const,
  wordBreak: 'break-all' as const,
}

const linkText = {
  color: '#5469d4',
  fontSize: '14px',
  textDecoration: 'underline',
}

const instructionsBox = {
  background: '#f0f9ff',
  border: '1px solid #bae6fd',
  borderRadius: '6px',
  margin: '24px 0',
  padding: '20px',
}

const instructionsTitle = {
  color: '#0369a1',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px 0',
}

const instructionsList = {
  margin: '0',
  padding: '0 0 0 20px',
}

const instructionItem = {
  color: '#0369a1',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
}

const warningBox = {
  background: '#fef3c7',
  border: '1px solid #fbbf24',
  borderRadius: '6px',
  margin: '24px 0',
  padding: '16px',
}

const warningText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const link = {
  color: '#5469d4',
  textDecoration: 'underline',
}

const footer = {
  borderTop: '1px solid #eaeaea',
  marginTop: '32px',
  paddingTop: '16px',
}

const footerText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '4px 0',
  textAlign: 'center' as const,
}