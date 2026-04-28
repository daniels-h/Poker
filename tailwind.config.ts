import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Handover design tokens
        'bg-darkest': '#1a1a18',
        'bg-dark': '#1e1e1c',
        'bg-card': '#252420',
        'felt-green': '#2a4a2a',
        brass: '#b8943e',
        'brass-dark': '#8a6d2a',
        ivory: '#f5f0e8',
        'ivory-dim': '#a09882',
        ink: '#1a1a18',
        win: '#4a7c59',
        loss: '#b44040',
        // Legacy aliases
        felt: '#1e1e1c',
        'felt-deep': '#1a1a18',
        'felt-lit': '#2a4a2a',
        wood: '#1a1a18',
        'wood-lit': '#252420',
        'brass-dim': '#8a6d2a',

        // shadcn tokens
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        'dm-sans': ['var(--font-dm-sans)', 'DM Sans', 'Helvetica', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        // Legacy aliases used by admin pages
        fraunces: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        inter: ['var(--font-dm-sans)', 'DM Sans', 'Helvetica', 'sans-serif'],
      },
      borderRadius: {
        lg: '4px',
        md: '4px',
        sm: '2px',
        DEFAULT: '4px',
      },
    },
  },
  plugins: [],
};
export default config;
