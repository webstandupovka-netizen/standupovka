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

interface MagicLinkEmailProps {
  userEmail?: string
  magicLink?: string
  expiresIn?: string
  supportEmail?: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

export const MagicLinkEmail = ({
  userEmail = 'user@example.com',
  magicLink = `${baseUrl}/auth/verify`,
  expiresIn = '15 минут',
  supportEmail = 'support@standup.com',
}: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Ваша ссылка для входа в Standup</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="120"
              height="36"
              alt="Standup"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Вход в Standup</Heading>
          
          <Text style={heroText}>
            Мы получили запрос на вход в ваш аккаунт Standup с адреса {userEmail}.
          </Text>
          
          <Section style={codeBox}>
            <Text style={confirmationCodeText}>
              Нажмите на кнопку ниже, чтобы войти в систему. 
              Эта ссылка действительна в течение {expiresIn}.
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={magicLink}>
              Войти в Standup
            </Button>
          </Section>
          
          <Text style={paragraph}>
            Если кнопка не работает, скопируйте и вставьте эту ссылку в ваш браузер:
          </Text>
          
          <Section style={linkContainer}>
            <Link href={magicLink} style={linkText}>
              {magicLink}
            </Link>
          </Section>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Важно:</strong> Если вы не запрашивали этот вход, 
              просто проигнорируйте это письмо. Ваш аккаунт останется в безопасности.
            </Text>
          </Section>
          
          <Text style={paragraph}>
            <strong>Советы по безопасности:</strong>
          </Text>
          
          <Section style={tipsList}>
            <Text style={tipItem}>🔒 Никогда не делитесь этой ссылкой с другими</Text>
            <Text style={tipItem}>⏰ Ссылка автоматически истечет через {expiresIn}</Text>
            <Text style={tipItem}>🚫 Ссылка может быть использована только один раз</Text>
            <Text style={tipItem}>📧 Всегда проверяйте адрес отправителя</Text>
          </Section>
          
          <Text style={paragraph}>
            Если у вас есть вопросы или проблемы с входом, обратитесь к нашей 
            службе поддержки по адресу{' '}
            <Link href={`mailto:${supportEmail}`} style={link}>
              {supportEmail}
            </Link>
            .
          </Text>
          
          <Text style={paragraph}>
            С наилучшими пожеланиями,<br />
            Команда Standup
          </Text>
          
          <Section style={footer}>
            <Text style={footerText}>
              Это письмо было отправлено автоматически. Пожалуйста, не отвечайте на него.
            </Text>
            <Text style={footerText}>
              © 2024 Standup. Все права защищены.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

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

const codeBox = {
  background: 'rgb(245, 244, 245)',
  borderRadius: '4px',
  margin: '16px auto 14px',
  verticalAlign: 'middle',
  width: '100%',
  maxWidth: '400px',
}

const confirmationCodeText = {
  color: '#333',
  fontSize: '14px',
  fontWeight: 'bold',
  lineHeight: '24px',
  margin: '0',
  padding: '16px',
  textAlign: 'center' as const,
}

const buttonContainer = {
  margin: '27px auto',
  width: 'auto',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  width: '200px',
  padding: '14px 20px',
}

const paragraph = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const linkContainer = {
  background: '#f8f9fa',
  border: '1px solid #e9ecef',
  borderRadius: '4px',
  margin: '16px 0',
  padding: '12px',
  wordBreak: 'break-all' as const,
}

const linkText = {
  color: '#5469d4',
  fontSize: '14px',
  textDecoration: 'underline',
}

const warningBox = {
  background: '#fff3cd',
  border: '1px solid #ffeaa7',
  borderRadius: '4px',
  margin: '24px 0',
  padding: '16px',
}

const warningText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const tipsList = {
  margin: '16px 0',
  padding: '0 20px',
}

const tipItem = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '8px 0',
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