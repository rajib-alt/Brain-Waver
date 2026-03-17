// Supabase stub for GitHub Pages deployment.
// This app stores notes in GitHub and settings in localStorage — no server needed.
// If you want cloud auth/sync, fork this and configure a real Supabase project.

type Listener = (event: string, session: null) => void;

const noopAuth = {
  onAuthStateChange: (_cb: Listener) => ({ data: { subscription: { unsubscribe: () => {} } } }),
  getSession: async () => ({ data: { session: null }, error: null }),
  signOut: async () => {},
  signInWithOAuth: async () => {},
};

export const supabase = {
  auth: noopAuth,
  from: (_table: string) => ({
    select: (_cols: string) => ({ eq: (_col: string, _val: any) => Promise.resolve({ data: [], error: null }) }),
    upsert: (_data: any, _opts?: any) => Promise.resolve({ data: null, error: null }),
  }),
} as any;
