import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./src/**/*.{ts,tsx}",
		"./index.html",
	],
	prefix: "",
	// Optimize bundle size by purging unused styles
	safelist: [
		// Keep essential classes that might be added dynamically
		'property-grid',
		'card-modern',
		'btn-modern-primary',
		'btn-modern-secondary',
		'input-modern',
		'nav-modern',
		'modal-backdrop',
		'loading-spinner',
		'skeleton',
		// Animation classes
		'animate-spin',
		'animate-pulse',
		'animate-bounce',
		// Focus and hover states
		'focus-visible:ring-2',
		'hover:shadow-lg',
		'hover:-translate-y-1',
		// Responsive classes for key components
		'sm:grid-cols-2',
		'md:grid-cols-3',
		'lg:grid-cols-4',
		'xl:grid-cols-4',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			// Modern Color System using CSS Custom Properties
			colors: {
				// Keep existing shadcn/ui colors for compatibility
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					// Modern primary color scale
					50: 'rgb(var(--color-primary-50))',
					100: 'rgb(var(--color-primary-100))',
					500: 'rgb(var(--color-primary-500))',
					600: 'rgb(var(--color-primary-600))',
					700: 'rgb(var(--color-primary-700))',
					800: 'rgb(var(--color-primary-800))',
					900: 'rgb(var(--color-primary-900))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					// Modern secondary color scale
					50: 'rgb(var(--color-secondary-50))',
					100: 'rgb(var(--color-secondary-100))',
					400: 'rgb(var(--color-secondary-400))',
					500: 'rgb(var(--color-secondary-500))',
					600: 'rgb(var(--color-secondary-600))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Modern semantic colors
				success: {
					50: 'rgb(var(--color-success-50))',
					100: 'rgb(var(--color-success-100))',
					500: 'rgb(var(--color-success-500))',
					600: 'rgb(var(--color-success))',
				},
				warning: {
					50: 'rgb(var(--color-warning-50))',
					100: 'rgb(var(--color-warning-100))',
					500: 'rgb(var(--color-warning))',
				},
				error: {
					50: 'rgb(var(--color-error-50))',
					100: 'rgb(var(--color-error-100))',
					500: 'rgb(var(--color-error-500))',
					600: 'rgb(var(--color-error))',
				},
				// Modern neutral colors
				white: 'rgb(var(--color-white))',
				gray: {
					50: 'rgb(var(--color-gray-50))',
					100: 'rgb(var(--color-gray-100))',
					200: 'rgb(var(--color-gray-200))',
					300: 'rgb(var(--color-gray-300))',
					400: 'rgb(var(--color-gray-400))',
					500: 'rgb(var(--color-gray-500))',
					600: 'rgb(var(--color-gray-600))',
					700: 'rgb(var(--color-gray-700))',
					800: 'rgb(var(--color-gray-800))',
					900: 'rgb(var(--color-gray-900))',
				},
				// Background variations
				'background-subtle': 'rgb(var(--color-background-subtle))',
				'background-muted': 'rgb(var(--color-background-muted))',
			},
			// Modern Border Radius System
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Modern radius scale
				'radius-sm': 'var(--radius-sm)',
				'radius-md': 'var(--radius-md)',
				'radius-lg': 'var(--radius-lg)',
				'radius-xl': 'var(--radius-xl)',
			},
			// Modern Spacing System
			spacing: {
				'spacing-1': 'var(--spacing-1)',
				'spacing-2': 'var(--spacing-2)',
				'spacing-3': 'var(--spacing-3)',
				'spacing-4': 'var(--spacing-4)',
				'spacing-5': 'var(--spacing-5)',
				'spacing-6': 'var(--spacing-6)',
				'spacing-8': 'var(--spacing-8)',
				'spacing-10': 'var(--spacing-10)',
				'spacing-12': 'var(--spacing-12)',
				'spacing-16': 'var(--spacing-16)',
				// Add consistent spacing aliases
				'xs': 'var(--spacing-1)',
				'sm': 'var(--spacing-2)',
				'md': 'var(--spacing-4)',
				'lg': 'var(--spacing-6)',
				'xl': 'var(--spacing-8)',
				'2xl': 'var(--spacing-12)',
				'3xl': 'var(--spacing-16)',
			},
			// Modern Shadow System
			boxShadow: {
				'card': 'var(--shadow-card)',
				'card-hover': 'var(--shadow-card-hover)',
				'card-elevated': 'var(--shadow-card-elevated)',
				'modern-sm': 'var(--shadow-sm)',
				'modern-md': 'var(--shadow-md)',
				'modern-lg': 'var(--shadow-lg)',
				'modern-xl': 'var(--shadow-xl)',
				'modern-2xl': 'var(--shadow-2xl)',
			},
			// Modern Typography System
			fontFamily: {
				'primary': 'var(--font-family-primary)',
				'sans': 'var(--font-family-primary)',
			},
			fontSize: {
				'modern-xs': 'var(--font-size-xs)',
				'modern-sm': 'var(--font-size-sm)',
				'modern-base': 'var(--font-size-base)',
				'modern-lg': 'var(--font-size-lg)',
				'modern-xl': 'var(--font-size-xl)',
				'modern-2xl': 'var(--font-size-2xl)',
				'modern-3xl': 'var(--font-size-3xl)',
				'modern-4xl': 'var(--font-size-4xl)',
			},
			fontWeight: {
				'modern-normal': 'var(--font-weight-normal)',
				'modern-medium': 'var(--font-weight-medium)',
				'modern-semibold': 'var(--font-weight-semibold)',
				'modern-bold': 'var(--font-weight-bold)',
			},
			lineHeight: {
				'modern-tight': 'var(--line-height-tight)',
				'modern-normal': 'var(--line-height-normal)',
				'modern-relaxed': 'var(--line-height-relaxed)',
			},
			// Modern Z-Index System
			zIndex: {
				'dropdown': 'var(--z-dropdown)',
				'sticky': 'var(--z-sticky)',
				'fixed': 'var(--z-fixed)',
				'modal-backdrop': 'var(--z-modal-backdrop)',
				'modal': 'var(--z-modal)',
				'popover': 'var(--z-popover)',
				'tooltip': 'var(--z-tooltip)',
				'toast': 'var(--z-toast)',
			},
			// Modern Transition System
			transitionDuration: {
				'fast': 'var(--transition-fast)',
				'normal': 'var(--transition-normal)',
				'slow': 'var(--transition-slow)',
			},
			// Component Heights
			height: {
				'button-sm': 'var(--button-height-sm)',
				'button-md': 'var(--button-height-md)',
				'button-lg': 'var(--button-height-lg)',
				'input': 'var(--input-height)',
			},
			minHeight: {
				'button-sm': 'var(--button-height-sm)',
				'button-md': 'var(--button-height-md)',
				'button-lg': 'var(--button-height-lg)',
				'input': 'var(--input-height)',
			},
			// Modern Animations
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in var(--transition-normal) ease-out',
				'slide-up': 'slide-up var(--transition-normal) ease-out',
				'scale-in': 'scale-in var(--transition-fast) ease-out',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
