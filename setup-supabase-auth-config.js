#!/usr/bin/env node

/**
 * Script to configure Supabase Auth settings including magic link expiration
 * This will increase the magic link expiration time and configure other auth settings
 */

require('dotenv').config({ path: '.env.local' });

const PROJECT_REF = 'npxqxjrunqroavlzvdce'; // Extracted from SUPABASE_URL
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN; // Need to get from dashboard

const authConfig = {
  // Email settings
  external_email_enabled: true,
  mailer_secure_email_change_enabled: true,
  mailer_autoconfirm: false,
  smtp_admin_email: process.env.EMAIL_FROM || 'noreply@standupovka.live',
  smtp_host: process.env.SMTP_HOST || 'smtp.resend.com',
  smtp_port: parseInt(process.env.SMTP_PORT) || 587,
  smtp_user: process.env.SMTP_USER || 'resend',
  smtp_pass: process.env.SMTP_PASS || process.env.RESEND_API_KEY,
  smtp_sender_name: 'Standupovka',
  
  // Magic link settings - увеличиваем время жизни
  mailer_otp_exp: 3600, // 1 hour (default is 300 seconds = 5 minutes)
  
  // Site URL settings
  site_url: 'https://www.standupovka.live',
  
  // Redirect URLs
  additional_redirect_urls: [
    'https://www.standupovka.live/auth/callback',
    'http://localhost:3001/auth/callback'
  ],
  
  // Security settings
  security_captcha_enabled: false,
  security_update_password_require_reauthentication: true,
  
  // Session settings
  jwt_exp: 3600, // 1 hour
  refresh_token_rotation_enabled: true,
  
  // Rate limiting
  rate_limit_email_sent: 60, // 1 email per minute
  rate_limit_sms_sent: 60,   // 1 SMS per minute
};

async function configureSupabaseAuth() {
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
    console.log('🔧 Configuring Supabase Auth settings...');
    console.log('📧 SMTP Host:', authConfig.smtp_host);
    console.log('📧 SMTP Port:', authConfig.smtp_port);
    console.log('📧 From Email:', authConfig.smtp_admin_email);
    console.log('⏰ Magic Link Expiration:', authConfig.mailer_otp_exp, 'seconds');
    console.log('🌐 Site URL:', authConfig.site_url);
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authConfig)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ Supabase Auth configuration updated successfully!');
    console.log('\n📋 Configuration applied:');
    console.log('- External email enabled: ✅');
    console.log('- SMTP Host:', authConfig.smtp_host);
    console.log('- SMTP Port:', authConfig.smtp_port);
    console.log('- From Email:', authConfig.smtp_admin_email);
    console.log('- Sender Name:', authConfig.smtp_sender_name);
    console.log('- Magic Link Expiration:', authConfig.mailer_otp_exp, 'seconds (', Math.floor(authConfig.mailer_otp_exp / 60), 'minutes )');
    console.log('- Site URL:', authConfig.site_url);
    console.log('- JWT Expiration:', authConfig.jwt_exp, 'seconds');
    
    console.log('\n🎉 Supabase Auth configuration updated!');
    console.log('\n⚠️  Important notes:');
    console.log('- Magic links now expire after 1 hour instead of 5 minutes');
    console.log('- Make sure to test the authentication flow');
    console.log('- Check that redirect URLs are properly configured');
    
  } catch (error) {
    console.error('❌ Failed to configure Supabase Auth:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n🔑 Authentication failed. Please check your SUPABASE_ACCESS_TOKEN.');
    } else if (error.message.includes('403')) {
      console.log('\n🚫 Permission denied. Make sure your token has the required permissions.');
    } else if (error.message.includes('422')) {
      console.log('\n⚠️  Some configuration values may be invalid. Check the Supabase dashboard.');
    }
  }
}

// Run the configuration
configureSupabaseAuth();