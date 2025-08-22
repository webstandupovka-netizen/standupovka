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

interface WelcomeEmailProps {
  userFirstname?: string
  loginUrl?: string
  supportEmail?: string
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')

export const WelcomeEmail = ({
  userFirstname = 'Пользователь',
  loginUrl = `${baseUrl}/auth/login`,
  supportEmail = 'support@standup.com',
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Добро пожаловать в Standup! Ваш аккаунт готов к использованию.</Preview>
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
          
          <Heading style={h1}>Добро пожаловать в Standup!</Heading>
          
          <Text style={heroText}>
            Привет, {userFirstname}! Мы рады приветствовать вас в нашей платформе 
            для управления задачами и проектами.
          </Text>
          
          <Section style={codeBox}>
            <Text style={confirmationCodeText}>
              Ваш аккаунт успешно создан и готов к использованию. 
              Теперь вы можете войти в систему и начать работу с задачами.
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Войти в аккаунт
            </Button>
          </Section>
          
          <Text style={paragraph}>
            <strong>Что вы можете делать в Standup:</strong>
          </Text>
          
          <Section style={featuresList}>
            <Text style={featureItem}>✅ Создавать и управлять задачами</Text>
            <Text style={featureItem}>📊 Отслеживать прогресс проектов</Text>
            <Text style={featureItem}>👥 Сотрудничать с командой</Text>
            <Text style={featureItem}>📈 Анализировать продуктивность</Text>
            <Text style={featureItem}>🎯 Устанавливать приоритеты</Text>
          </Section>
          
          <Text style={paragraph}>
            Если у вас есть вопросы или нужна помощь, не стесняйтесь обращаться 
            к нашей службе поддержки по адресу{' '}
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

export default WelcomeEmail

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
  width: '280px',
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
}

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '3px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
}

const paragraph = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const featuresList = {
  margin: '16px 0',
  padding: '0 20px',
}

const featureItem = {
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