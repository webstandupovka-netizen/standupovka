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

const LOGO_URL = 'https://npxqxjrunqroavlzvdce.supabase.co/storage/v1/object/public/posters/stand.png'

export const PaymentSuccessEmail = ({
  userFirstname = 'Utilizator',
  streamTitle = 'Seara de Stand-up',
  streamDate = '',
  streamTime = '',
  amount = 300,
  currency = 'MDL',
  streamUrl = 'https://standupovka.live/stream',
  supportEmail = 'standupovkaclub@gmail.com',
}: PaymentSuccessEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Plata confirmată! Accesul la "{streamTitle}" a fost activat.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img src={LOGO_URL} width="180" height="50" alt="Standupovka" style={logo} />
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={greeting}>Salut, {userFirstname}!</Text>

            <Text style={paragraph}>
              Plata dvs. a fost procesată cu succes. Accesul la transmisiune a fost activat.
            </Text>

            {/* Event card */}
            <Section style={eventCard}>
              <Text style={eventTitle}>{streamTitle}</Text>
              {(streamDate || streamTime) && (
                <Text style={eventMeta}>
                  {streamDate && `${streamDate}`}{streamTime && ` • ${streamTime}`}
                </Text>
              )}
              <Text style={eventPrice}>{amount} {currency}</Text>
            </Section>

            {/* CTA */}
            <Section style={buttonContainer}>
              <Button style={button} href={streamUrl}>
                Vizionează transmisiunea
              </Button>
            </Section>

            {/* Instructions */}
            <Section style={infoBox}>
              <Text style={infoTitle}>Cum vizionezi:</Text>
              <Text style={infoItem}>1. Conectați-vă pe site cu e-mailul dvs.</Text>
              <Text style={infoItem}>2. Apăsați butonul de mai sus sau accesați pagina principală</Text>
              <Text style={infoItem}>3. Vizionarea este disponibilă pe un singur dispozitiv simultan</Text>
            </Section>

            <Section style={divider} />

            <Text style={smallText}>
              Înregistrarea va fi disponibilă după terminarea evenimentului.
              Dacă aveți probleme cu accesul, contactați-ne la{' '}
              <Link href={`mailto:${supportEmail}`} style={linkAnchor}>{supportEmail}</Link>
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

export default PaymentSuccessEmail

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

const eventCard = {
  backgroundColor: '#111111',
  borderRadius: '10px',
  padding: '24px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}

const eventTitle = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700' as const,
  margin: '0 0 8px',
}

const eventMeta = {
  color: '#999999',
  fontSize: '13px',
  margin: '0 0 12px',
}

const eventPrice = {
  color: '#22c55e',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '0',
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

const infoBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const infoTitle = {
  color: '#333333',
  fontSize: '14px',
  fontWeight: '600' as const,
  margin: '0 0 10px',
}

const infoItem = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '22px',
  margin: '0',
}

const divider = {
  borderTop: '1px solid #eeeeee',
  margin: '20px 0',
}

const smallText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '0',
}

const linkAnchor = {
  color: '#dc2626',
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
