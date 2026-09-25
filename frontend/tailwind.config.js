/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./utils/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          hover: "hsl(var(--primary-hover))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          gold: "#D4AF37",
          ashram: "#3b82f6",
        },
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        // Museum Curatorial Palette
        "bg-canvas": "#FAF7F0",
        "surface-cream": "#F3E4C9",
        "surface-white": "#FFFFFF",
        "text-navy": "#0A2947",
        "text-muted": "#3D5A80",
        "border-sage": "#D3D4C0",
        "accent-brown": "#8B5E3C",
        "accent-gold": "#C89D56",
        "tricolor-saffron": "#E76F51",
        "tricolor-green": "#2A9D8F",
      },
      fontFamily: {
        cinzel: ["Cinzel", "serif"],
        playfair: ["Playfair Display", "Georgia", "serif"],
        "serif-editorial": ["Playfair Display", "Georgia", "serif"],
        archivo: ["Archivo Black", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
        heading: ["Montserrat", "sans-serif"],
        dmsans: ["DM Sans", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["DM Sans", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.25)",
        glow: "0 0 25px -5px rgba(212, 175, 55, 0.3)",
        "2xs": "0 1px 2px 0 rgba(10, 41, 71, 0.05)",
        xs: "0 1px 3px 0 rgba(10, 41, 71, 0.08)",
      },
    },
  },
  plugins: [],
};
