require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateMagicLink() {
  try {
    const testEmail = 'test@example.com';
    console.log(`Generating magic link for: ${testEmail}`);
    
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail,
      options: {
        redirectTo: 'http://localhost:3002/buy?streamId=550e8400-e29b-41d4-a716-446655440000'
      }
    });
    
    if (error) {
      console.error('Error generating magic link:', error);
      return;
    }
    
    console.log('✅ Magic link generated:');
    console.log('🔗 Link:', data.properties.action_link);
    console.log('\n📋 Copy this link and open it in your browser to login as test user');
    
  } catch (error) {
    console.error('Script error:', error);
  }
}

generateMagicLink();