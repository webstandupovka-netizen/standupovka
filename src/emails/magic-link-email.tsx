import {
  Body,
  Button,
  Container,
  Head,
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

const LOGO_URL = 'https://npxqxjrunqroavlzvdce.supabase.co/storage/v1/object/public/posters/stand.png'

export const MagicLinkEmail = ({
  userEmail = 'user@example.com',
  magicLink = 'https://standupovka.live/auth/verify',
  expiresIn = '1 oră',
  supportEmail = 'standupovkaclub@gmail.com',
}: MagicLinkEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Linkul dvs. de conectare la Standupovka</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img src={LOGO_URL} width="180" height="50" alt="Standupovka" style={logo} />
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Bună!</Text>

            <Text style={paragraph}>
              Am primit o cerere de conectare pentru <strong>{userEmail}</strong>.
              Apăsați butonul de mai jos pentru a vă conecta la cont.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={magicLink}>
                Conectare la Standupovka
              </Button>
            </Section>

            <Text style={expiry}>
              Linkul este valabil {expiresIn} și poate fi folosit o singură dată.
            </Text>

            {/* Fallback link */}
            <Section style={divider} />

            <Text style={smallText}>
              Dacă butonul nu funcționează, copiați acest link:
            </Text>
            <Text style={linkStyle}>
              <Link href={magicLink} style={linkAnchor}>
                {magicLink}
              </Link>
            </Text>

            <Section style={divider} />

            <Text style={smallText}>
              Dacă nu ați solicitat această conectare, ignorați acest email.
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link href={`mailto:${supportEmail}`} style={footerLink}>{supportEmail}</Link>
            </Text>
            <Text style={footerText}>
              © {new Date().getFullYear()} Standupovka. Toate drepturile rezervate.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default MagicLinkEmail

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '480px',
}

const header = {
  backgroundColor: '#111111',
  borderRadius: '12px 12px 0 0',
  padding: '32px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  backgroundColor: '#ffffff',
  padding: '32px 32px 24px',
}

const greeting = {
  color: '#111111',
  fontSize: '22px',
  fontWeight: '700' as const,
  margin: '0 0 16px',
}

const paragraph = {
  color: '#444444',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 24px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const button = {
  backgroundColor: '#dc2626',
  borderRadius: '10px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
}

const expiry = {
  color: '#888888',
  fontSize: '13px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const divider = {
  borderTop: '1px solid #eeeeee',
  margin: '20px 0',
}

const smallText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0 0 8px',
}

const linkStyle = {
  margin: '0 0 0',
  wordBreak: 'break-all' as const,
}

const linkAnchor = {
  color: '#dc2626',
  fontSize: '12px',
  textDecoration: 'underline',
}

const footer = {
  backgroundColor: '#111111',
  borderRadius: '0 0 12px 12px',
  padding: '20px 32px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#666666',
  fontSize: '11px',
  lineHeight: '16px',
  margin: '2px 0',
}

const footerLink = {
  color: '#999999',
  textDecoration: 'underline',
}
