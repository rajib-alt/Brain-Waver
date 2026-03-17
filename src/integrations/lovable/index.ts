// Lovable auth stub for GitHub Pages deployment.
// OAuth sign-in is not available in the static build.
export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: string, _opts?: any) => {
      console.warn('OAuth sign-in is not available in the GitHub Pages build.');
      return { error: new Error('OAuth not configured') };
    },
  },
};

