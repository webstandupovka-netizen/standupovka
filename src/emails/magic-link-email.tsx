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
  expiresIn = '15 minute',
  supportEmail = 'standupovkaclub@gmail.com',
}: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Link-ul dvs. de conectare la Standup</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src="https://standupovka.live/event_poster.jpg"
              width="400"
              height="400"
              alt="Standupovka"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>Conectare la Standup</Heading>
          
          <Text style={heroText}>
            Am primit o cerere de conectare la contul dvs. Standup de la adresa {userEmail}.
          </Text>
          
          <Section style={codeBox}>
            <Text style={confirmationCodeText}>
              Faceți clic pe butonul de mai jos pentru a vă conecta la sistem. 
              Acest link este valabil timp de {expiresIn}.
            </Text>
          </Section>
          
          <Section style={buttonContainer}>
            <Button style={button} href={magicLink}>
              Conectare la Standup
            </Button>
          </Section>
          
          <Text style={paragraph}>
            Dacă butonul nu funcționează, copiați și lipiți acest link în browser:
          </Text>
          
          <Section style={linkContainer}>
            <Link href={magicLink} style={linkText}>
              {magicLink}
            </Link>
          </Section>
          
          <Section style={warningBox}>
            <Text style={warningText}>
              ⚠️ <strong>Important:</strong> Dacă nu ați solicitat această conectare, 
              ignorați acest email. Contul dvs. va rămâne în siguranță.
            </Text>
          </Section>
          
          <Text style={paragraph}>
            <strong>Sfaturi de securitate:</strong>
          </Text>
          
          <Section style={tipsList}>
            <Text style={tipItem}>🔒 Nu împărtășiți niciodată acest link cu alții</Text>
            <Text style={tipItem}>⏰ Link-ul va expira automat după {expiresIn}</Text>
            <Text style={tipItem}>🚫 Link-ul poate fi folosit o singură dată</Text>
            <Text style={tipItem}>📧 Verificați întotdeauna adresa expeditorului</Text>
          </Section>
          
          <Text style={paragraph}>
            Dacă aveți întrebări sau probleme cu conectarea, contactați 
            echipa noastră de suport la adresa{' '}
            <Link href={`mailto:${supportEmail}`} style={link}>
              {supportEmail}
            </Link>
            .
          </Text>
          
          <Text style={paragraph}>
            Cu cele mai bune urări,<br />
            Standupovka
          </Text>
          
          <Section style={footer}>
            <Text style={footerText}>
              Acest email a fost trimis automat. Vă rugăm să nu răspundeți.
            </Text>
            <Text style={footerText}>
              © 2025 Standupovka. Toate drepturile rezervate.
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