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
  userFirstname = 'Utilizator',
  loginUrl = `${baseUrl}/auth/login`,
  supportEmail = 'support@standup.com',
}: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bun venit la Standup! Contul dvs. este gata de utilizare.</Preview>
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
          
          <Heading style={h1}>Bun venit la Standup!</Heading>
          
          <Text style={heroText}>
            Salut, {userFirstname}! Suntem bucuroși să vă întâmpinăm pe platforma noastră 
            pentru gestionarea sarcinilor și proiectelor.
          </Text>
          
          <Section style={codeBox}>
            <Text style={confirmationCodeText}>
              Contul dvs. a fost creat cu succes și este gata de utilizare. 
              Acum vă puteți conecta în sistem și începe să lucrați cu sarcinile.
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Conectează-te în cont
            </Button>
          </Section>
          
          <Text style={paragraph}>
            <strong>Ce puteți face în Standup:</strong>
          </Text>
          
          <Section style={featuresList}>
            <Text style={featureItem}>✅ Creați și gestionați sarcini</Text>
            <Text style={featureItem}>📊 Urmăriți progresul proiectelor</Text>
            <Text style={featureItem}>👥 Colaborați cu echipa</Text>
            <Text style={featureItem}>📈 Analizați productivitatea</Text>
            <Text style={featureItem}>🎯 Stabiliți priorități</Text>
          </Section>
          
          <Text style={paragraph}>
            Dacă aveți întrebări sau aveți nevoie de ajutor, nu ezitați să contactați 
            serviciul nostru de suport la adresa{' '}
            <Link href={`mailto:${supportEmail}`} style={link}>
              {supportEmail}
            </Link>
            .
          </Text>
          
          <Text style={paragraph}>
            Cu cele mai bune urări,<br />
            Echipa Standup
          </Text>
          
          <Section style={footer}>
            <Text style={footerText}>
              Acest email a fost trimis automat. Vă rugăm să nu răspundeți la el.
            </Text>
            <Text style={footerText}>
              © 2024 Standup. Toate drepturile rezervate.
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