/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		fontFamily: {
  			inter: ['var(--font-inter)']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
  			'pulse-glow': {
  				'0%, 100%': { boxShadow: '0 0 30px rgba(255,100,0,0.6), 0 0 60px rgba(255,80,0,0.4)' },
  				'50%': { boxShadow: '0 0 50px rgba(255,100,0,0.8), 0 0 100px rgba(238,30,140,0.6)' }
  			},
  			'float': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-12px)' }
  			},
  			'breathe': {
  				'0%, 100%': { boxShadow: '0 0 20px rgba(255,100,0,0.4), 0 0 40px rgba(238,30,140,0.2)' },
  				'50%': { boxShadow: '0 0 35px rgba(255,100,0,0.7), 0 0 70px rgba(238,30,140,0.4)' }
  			},
  			'bounce-gentle': {
  				'0%, 100%': { transform: 'scale(1)' },
  				'50%': { transform: 'scale(1.05)' }
  			},
  			'spin-slow': {
  				'from': { transform: 'rotate(0deg)' },
  				'to': { transform: 'rotate(360deg)' }
  			},
  			'shimmer': {
  				'0%': { backgroundPosition: '-1000px 0' },
  				'100%': { backgroundPosition: '1000px 0' }
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
  			'float': 'float 4s ease-in-out infinite',
  			'breathe': 'breathe 3s ease-in-out infinite',
  			'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
  			'spin-slow': 'spin-slow 8s linear infinite',
  			'shimmer': 'shimmer 3s linear infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
