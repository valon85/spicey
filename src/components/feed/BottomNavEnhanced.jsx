// This file re-exports BottomNav — they are now identical.
// BottomNavEnhanced was previously causing iOS nav bar disappearance due to
// framer-motion infinite animations on fixed elements.
export { default } from './BottomNav';