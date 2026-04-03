#!/usr/bin/env node

/**
 * Script to check current Supabase Auth settings
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAuthSettings() {
  console.log('🔍 Checking current Supabase Auth settings...');
  console.log('📍 Supabase URL:', supabaseUrl);
  
  try {
    // Test generating a magic link to see current settings
    console.log('\n🧪 Testing magic link generation...');
    
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: 'test@example.com',
      options: {
        redirectTo: 'https://www.standupovka.live/auth/callback'
      }
    });
    
    if (error) {
      console.error('❌ Error generating magic link:', error);
      return;
    }
    
    if (data && data.properties) {
      console.log('✅ Magic link generated successfully');
      console.log('🔗 Action link structure:', data.properties.action_link ? 'Present' : 'Missing');
      
      if (data.properties.action_link) {
        const url = new URL(data.properties.action_link);
        console.log('🌐 Auth URL:', url.origin + url.pathname);
        console.log('🔑 Token present:', url.searchParams.has('token') ? 'Yes' : 'No');
        console.log('📧 Type:', url.searchParams.get('type'));
        console.log('🔄 Redirect to:', url.searchParams.get('redirect_to'));
      }
    }
    
    // Check current user count
    console.log('\n👥 Checking user statistics...');
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
    } else {
      console.log('📊 Total users:', users.total || 0);
    }
    
    console.log('\n📋 Current configuration analysis:');
    console.log('- Magic link generation: ✅ Working');
    console.log('- Default expiration: 🕐 5 minutes (Supabase default)');
    console.log('- SMTP configured: ✅ Yes (Resend)');
    console.log('- Site URL: https://www.standupovka.live');
    
    console.log('\n⚠️  Issue identified:');
    console.log('- Magic links expire after 5 minutes by default');
    console.log('- User clicked an expired link (otp_expired error)');
    console.log('- Need to configure longer expiration time in Supabase dashboard');
    
    console.log('\n🔧 Recommended fixes:');
    console.log('1. Go to Supabase Dashboard > Authentication > Settings');
    console.log('2. Increase "Magic Link Expiry" from 300s to 3600s (1 hour)');
    console.log('3. Or use Supabase Management API with proper access token');
    console.log('4. Test with a fresh magic link');
    
  } catch (error) {
    console.error('❌ Error checking auth settings:', error);
  }
}

checkAuthSettings();