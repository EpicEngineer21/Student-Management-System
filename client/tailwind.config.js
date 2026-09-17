/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Indigo 600 - sleek and modern
        'primary-hover': '#4338CA', // Indigo 700
        nav: '#0F172A', // Slate 900 - rich dark theme
        background: '#F8FAFC', // Slate 50 - crisp neutral background
        surface: '#FFFFFF',
        main: '#0F172A', // Slate 900 for main text
        secondary: '#64748B', // Slate 500 for secondary text
        border: '#E2E8F0', // Slate 200
        success: '#10B981', // Emerald 500
        warning: '#F59E0B', // Amber 500
        danger: '#EF4444', // Red 500
        info: '#0EA5E9', // Sky 500
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(15, 23, 42, 0.05)',
        'md': '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -1px rgba(15, 23, 42, 0.03)',
        'lg': '0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -2px rgba(15, 23, 42, 0.025)',
        'soft': '0 4px 20px -2px rgba(15, 23, 42, 0.05)',
        'card': '0px 1px 3px rgba(15, 23, 42, 0.08), 0px 4px 12px rgba(15, 23, 42, 0.04)',
        'glow': '0 0 15px rgba(79, 70, 229, 0.3)',
      },
      borderRadius: {
        'md': '0.5rem', // 8px
        'lg': '0.75rem', // 12px
        'xl': '1rem', // 16px
        '2xl': '1.5rem', // 24px
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
