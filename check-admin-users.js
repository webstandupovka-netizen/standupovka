require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkAdminUsers() {
  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
    
    if (error) {
      console.error('Error fetching admin users:', error)
      return
    }
    
    console.log('Admin users found:', data.length)
    data.forEach(user => {
      console.log(`- Username: ${user.username}, Email: ${user.email}, Active: ${user.is_active}`)
    })
  } catch (err) {
    console.error('Script error:', err)
  }
}

checkAdminUsers()