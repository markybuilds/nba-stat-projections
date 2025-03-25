import { FullConfig } from '@playwright/test';
import { environment } from '../config/test-config';
import cleanup from '../scripts/test-cleanup';
import { createClient } from '@supabase/supabase-js';

// Global teardown function
async function globalTeardown(config: FullConfig) {
  console.log('Starting global test teardown...');
  
  try {
    // Create Supabase client
    const supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
    
    // Run cleanup tasks
    await cleanup.cleanup({
      archive: true // Archive test results before cleanup
    });
    
    // Additional cleanup tasks
    await cleanupTestUsers(supabase);
    await cleanupTestStorage(supabase);
    await cleanupTestFunctions(supabase);
    
    console.log('Global test teardown completed successfully');
  } catch (error) {
    console.error('Error during global test teardown:', error);
    throw error;
  }
}

// Clean up test users
async function cleanupTestUsers(supabase: any) {
  console.log('Cleaning up test users...');
  
  try {
    // Get list of test users
    const { data: users, error: getUsersError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', 'like', '%test%');
    
    if (getUsersError) throw getUsersError;
    
    // Delete test users
    for (const user of users) {
      await supabase.auth.admin.deleteUser(user.id);
    }
    
    console.log(`Cleaned up ${users.length} test users`);
  } catch (error) {
    console.error('Error cleaning up test users:', error);
    throw error;
  }
}

// Clean up test storage
async function cleanupTestStorage(supabase: any) {
  console.log('Cleaning up test storage...');
  
  try {
    // List all objects in test bucket
    const { data: objects, error: listError } = await supabase
      .storage
      .from('test-bucket')
      .list();
    
    if (listError) throw listError;
    
    // Delete test objects
    if (objects.length > 0) {
      const { error: deleteError } = await supabase
        .storage
        .from('test-bucket')
        .remove(objects.map(obj => obj.name));
      
      if (deleteError) throw deleteError;
    }
    
    console.log(`Cleaned up ${objects.length} test storage objects`);
  } catch (error) {
    console.error('Error cleaning up test storage:', error);
    throw error;
  }
}

// Clean up test functions
async function cleanupTestFunctions(supabase: any) {
  console.log('Cleaning up test functions...');
  
  try {
    // Get list of test functions
    const { data: functions, error: getFunctionsError } = await supabase
      .rpc('list_test_functions');
    
    if (getFunctionsError) throw getFunctionsError;
    
    // Delete test functions
    for (const func of functions) {
      await supabase.rpc('delete_function', { function_name: func.name });
    }
    
    console.log(`Cleaned up ${functions.length} test functions`);
  } catch (error) {
    console.error('Error cleaning up test functions:', error);
    throw error;
  }
}

// Export teardown function
export default globalTeardown; 