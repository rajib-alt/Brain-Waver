import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

const SYNC_KEYS = ['zettel-github-config', 'zettel-openrouter-key', 'finance-transactions'];

export function useSettingsSync(user: User | null) {
  // Load settings from DB when user logs in
  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id);
      
      if (error || !data) return;
      
      for (const row of data) {
        if (row.setting_value !== null) {
          localStorage.setItem(row.setting_key, row.setting_value);
        }
      }
      // Trigger a storage event so stores re-read
      window.dispatchEvent(new Event('settings-synced'));
    };
    
    loadSettings();
  }, [user]);

  // Save settings to DB
  const syncToCloud = useCallback(async () => {
    if (!user) return;
    
    for (const key of SYNC_KEYS) {
      const value = localStorage.getItem(key);
      if (value === null) continue;
      
      await supabase
        .from('user_settings')
        .upsert(
          { user_id: user.id, setting_key: key, setting_value: value },
          { onConflict: 'user_id,setting_key' }
        );
    }
  }, [user]);

  // Auto-sync on storage changes
  useEffect(() => {
    if (!user) return;
    
    const handleStorage = () => syncToCloud();
    window.addEventListener('storage', handleStorage);
    
    // Also sync periodically
    const interval = setInterval(syncToCloud, 30000);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [user, syncToCloud]);

  return { syncToCloud };
}
