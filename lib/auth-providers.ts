export const isGoogleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );
  
  export const isGithubEnabled = Boolean(
    process.env.GITHUB_ID && process.env.GITHUB_SECRET
  );
  