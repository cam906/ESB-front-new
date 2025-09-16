/**
 * Tailwind config for the Next Admin area.
 * This file is referenced by `nextAdminCss.css` via `@config`.
 */
module.exports = {
  darkMode: 'class',
  content: [
    './nextAdminCss.css',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './node_modules/@premieroctet/next-admin/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};


