// Build script to generate config.js from environment variables
// This runs during Vercel deployment
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables must be set');
  process.exit(1);
}

const configContent = `// Supabase Configuration
// This file is generated automatically from environment variables during deployment
// Do not edit manually - it will be overwritten on deployment

export const supabaseConfig = {
  url: '${supabaseUrl}',
  anonKey: '${supabaseAnonKey}'
};
`;

fs.writeFileSync('config.js', configContent);
console.log('✓ Generated config.js from environment variables');

