import { FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

async function globalTeardown(config: FullConfig) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Clean up test data
  await supabase.from('players').delete().match({ id: 'test-player-1' });
  await supabase.from('games').delete().match({ id: 'test-game-1' });

  // Clean up test user
  const { error } = await supabase.auth.admin.deleteUser('test@example.com');
  
  if (error) {
    console.error('Error deleting test user:', error);
  }
}

export default globalTeardown; 