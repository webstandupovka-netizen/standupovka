require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupUserCreation() {
  try {
    console.log('Setting up user creation function...');
    
    // Create a function to handle user profile creation
    const { data, error } = await supabase.rpc('create_user_profile', {
      user_id: '00000000-0000-0000-0000-000000000000', // dummy call to test if function exists
      user_email: 'test@test.com',
      user_name: 'Test User'
    });
    
    if (error && error.code === 'PGRST202') {
      console.log('Function does not exist, this is expected.');
      console.log('We need to create the function manually in Supabase dashboard.');
      
      console.log('\nPlease execute this SQL in your Supabase SQL Editor:');
      console.log('\n--- START SQL ---');
      console.log(`
-- Function to create user profile
CREATE OR REPLACE FUNCTION public.create_user_profile(
  user_id UUID,
  user_email TEXT,
  user_name TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (user_id, user_email, user_name)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_profile TO anon;
`);
      console.log('--- END SQL ---\n');
      
    } else if (error) {
      console.error('Unexpected error:', error);
    } else {
      console.log('Function already exists and working!');
    }
    
  } catch (error) {
    console.error('Failed to setup user creation:', error);
  }
}

setupUserCreation();