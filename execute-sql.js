require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function executeSQLFile() {
  try {
    console.log('Reading SQL file...');
    const sql = fs.readFileSync('create-user-trigger.sql', 'utf8');
    
    console.log('Executing SQL commands...');
    
    // Разбиваем SQL на отдельные команды
    const commands = sql.split(';').filter(cmd => cmd.trim().length > 0);
    
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        console.log(`Executing command ${i + 1}/${commands.length}...`);
        console.log('Command:', command.substring(0, 100) + '...');
        
        try {
          const { data, error } = await supabase.rpc('exec', { sql: command + ';' });
          
          if (error) {
            console.error(`Error in command ${i + 1}:`, error);
            // Продолжаем выполнение других команд
          } else {
            console.log(`✅ Command ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.error(`Exception in command ${i + 1}:`, err.message);
        }
      }
    }
    
    console.log('\n=== Testing trigger ===');
    
    // Проверяем, что триггер работает
    console.log('Checking if trigger function exists...');
    const { data: functions, error: funcError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('proname', 'handle_new_user');
    
    if (funcError) {
      console.error('Error checking function:', funcError);
    } else if (functions && functions.length > 0) {
      console.log('✅ handle_new_user function exists');
    } else {
      console.log('❌ handle_new_user function not found');
    }
    
    // Проверяем триггер
    const { data: triggers, error: triggerError } = await supabase
      .from('pg_trigger')
      .select('tgname')
      .eq('tgname', 'on_auth_user_created');
    
    if (triggerError) {
      console.error('Error checking trigger:', triggerError);
    } else if (triggers && triggers.length > 0) {
      console.log('✅ on_auth_user_created trigger exists');
    } else {
      console.log('❌ on_auth_user_created trigger not found');
    }
    
  } catch (error) {
    console.error('Failed to execute SQL:', error);
  }
}

executeSQLFile();