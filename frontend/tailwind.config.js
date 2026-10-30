/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Base Canvas & Surfaces (Warm Zinc/Slate, NOT pure black or generic purple-blue)
        tactical: {
          void: "#090A0C",      // Deepest canvas background
          base: "#0F1115",      // Standard card/panel background
          surface: "#161920",   // Elevated components, dropdowns, headers
          hover: "#1D212A",     // Hover state for interactive items
          border: "#232833",    // Subtle, crisp boundary lines
          divider: "#1A1D24",   // Internal separators
        },
        // Accents (Muted, functional, high-readability signals)
        signal: {
          // Status: Operational / Clear Route (Subdued phosphor green, NOT radioactive neon)
          green: "#22C55E",
          greenMuted: "#14532D",
          greenBg: "rgba(34, 197, 94, 0.08)",

          // Status: Hazard / Stalled / Critical (Industrial amber-red / cadmium)
          alert: "#EF4444",
          alertMuted: "#7F1D1D",
          alertBg: "rgba(239, 68, 68, 0.09)",

          // Status: Advisory / Rerouting / Queue Warning (Warm amber)
          warn: "#F59E0B",
          warnMuted: "#78350F",
          warnBg: "rgba(245, 158, 11, 0.08)",

          // Status: Active Telemetry / Sensor Node (Cool steel-cyan)
          telemetry: "#38BDF8",
          telemetryMuted: "#0C4A6E",
          telemetryBg: "rgba(56, 189, 248, 0.08)",
        },
        // Typography & Contrast (Avoid pure #FFFFFF everywhere)
        textmuted: {
          primary: "#EDEDEE",   // High-emphasis metrics & headers
          secondary: "#9EA4B0", // Field labels & timestamps
          tertiary: "#5C6473",  // Grid borders, inactive icons, subtle units
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
        sans: ['"Inter"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      }
    }
  },
  plugins: [],
};
