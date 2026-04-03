#!/usr/bin/env node

/**
 * Script to configure Supabase Auth with custom SMTP settings
 * This will enable Supabase Auth to use Resend for sending emails
 */

require('dotenv').config({ path: '.env.local' });

const PROJECT_REF = 'npxqxjrunqroavlzvdce'; // Extracted from SUPABASE_URL
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN; // Need to get from dashboard

const smtpConfig = {
  external_email_enabled: true,
  mailer_secure_email_change_enabled: true,
  mailer_autoconfirm: false,
  smtp_admin_email: process.env.EMAIL_FROM || 'onboarding@resend.dev',
  smtp_host: process.env.SMTP_HOST || 'smtp.resend.com',
  smtp_port: parseInt(process.env.SMTP_PORT) || 587,
  smtp_user: process.env.SMTP_USER || 'resend',
  smtp_pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
  smtp_sender_name: 'Standupovka'
};

async function configureSupabaseSMTP() {
  if (!SUPABASE_ACCESS_TOKEN) {
    console.error('❌ SUPABASE_ACCESS_TOKEN not found!');
    console.log('\n📝 To get your access token:');
    console.log('1. Go to https://supabase.com/dashboard/account/tokens');
    console.log('2. Create a new token');
    console.log('3. Add it to your .env.local file as SUPABASE_ACCESS_TOKEN=your-token');
    console.log('4. Run this script again');
    return;
  }

  try {
    console.log('🔧 Configuring Supabase Auth SMTP settings...');
    console.log('📧 SMTP Host:', smtpConfig.smtp_host);
    console.log('📧 SMTP Port:', smtpConfig.smtp_port);
    console.log('📧 From Email:', smtpConfig.smtp_admin_email);
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(smtpConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Supabase SMTP configuration updated successfully!');
    console.log('\n📋 Configuration applied:');
    console.log('- External email enabled: ✅');
    console.log('- SMTP Host:', smtpConfig.smtp_host);
    console.log('- SMTP Port:', smtpConfig.smtp_port);
    console.log('- From Email:', smtpConfig.smtp_admin_email);
    console.log('- Sender Name:', smtpConfig.smtp_sender_name);
    
    console.log('\n🎉 Supabase Auth will now use Resend for sending emails!');
    console.log('\n⚠️  Note: You may need to adjust rate limits in the Supabase dashboard.');
    
  } catch (error) {
    console.error('❌ Failed to configure Supabase SMTP:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔑 Authentication failed. Please check your SUPABASE_ACCESS_TOKEN.');
    } else if (error.message.includes('403')) {
      console.log('\n🚫 Permission denied. Make sure your token has the required permissions.');
    }
  }
}

// Run the configuration
configureSupabaseSMTP();