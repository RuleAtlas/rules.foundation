import { style, globalStyle } from '@vanilla-extract/css'
import { vars } from '../theme.css'

// ============================================
// PAGE LAYOUT
// ============================================

export const page = style({
  position: 'relative',
  minHeight: '100vh',
  background: vars.color.void,
  color: vars.color.text,
})

export const gridOverlay = style({
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
  backgroundImage: `
    linear-gradient(rgba(59, 130, 246, 0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.015) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
})

export const container = style({
  position: 'relative',
  zIndex: 1,
  maxWidth: '900px',
  margin: '0 auto',
  padding: `${vars.space['3xl']} ${vars.space.xl}`,
})

// ============================================
// PAGE HEADER
// ============================================

export const pageHeader = style({
  marginBottom: vars.space['3xl'],
  paddingTop: vars.space['4xl'],
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
  fontWeight: 400,
  color: vars.color.text,
  margin: 0,
  marginBottom: vars.space.md,
})

export const lastUpdated = style({
  fontFamily: vars.font.body,
  fontSize: '0.9rem',
  color: vars.color.textTertiary,
  margin: 0,
})

// ============================================
// CONTENT
// ============================================

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space['2xl'],
})

export const section = style({
  paddingBottom: vars.space.xl,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  selectors: {
    '&:last-child': {
      borderBottom: 'none',
    },
  },
})

export const sectionTitle = style({
  fontFamily: vars.font.display,
  fontSize: '1.5rem',
  fontWeight: 400,
  color: vars.color.text,
  marginBottom: vars.space.md,
})

export const text = style({
  fontFamily: vars.font.body,
  fontSize: '1rem',
  color: vars.color.textSecondary,
  lineHeight: 1.6,
  margin: 0,
})

globalStyle(`${text} a`, {
  color: vars.color.precision,
  textDecoration: 'none',
  transition: `color ${vars.duration.fast}`,
})

globalStyle(`${text} a:hover`, {
  color: vars.color.warmth,
})
