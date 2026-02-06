import { style } from '@vanilla-extract/css'
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

export const bgGrid = style({
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
  backgroundImage: `
    linear-gradient(rgba(59, 130, 246, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.02) 1px, transparent 1px)
  `,
  backgroundSize: '80px 80px',
  maskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 30%, transparent 80%)',
  WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 20%, black 30%, transparent 80%)',
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
  textAlign: 'center',
  marginBottom: vars.space['5xl'],
  paddingTop: vars.space['5xl'],
})

export const title = style({
  fontFamily: vars.font.display,
  fontSize: 'clamp(2.5rem, 6vw, 4rem)',
  fontWeight: 400,
  color: vars.color.text,
  marginBottom: vars.space.xl,
  lineHeight: 1.1,
})

export const subtitle = style({
  fontFamily: vars.font.body,
  fontSize: '1.25rem',
  fontWeight: 300,
  color: vars.color.textSecondary,
  lineHeight: 1.6,
  maxWidth: '700px',
  margin: '0 auto',
})

// ============================================
// SECTIONS
// ============================================

export const section = style({
  marginBottom: vars.space['4xl'],
})

export const sectionTitle = style({
  fontFamily: vars.font.display,
  fontSize: '1.75rem',
  color: vars.color.text,
  marginBottom: vars.space.lg,
})

export const sectionText = style({
  fontFamily: vars.font.body,
  fontSize: '1.1rem',
  color: vars.color.textSecondary,
  lineHeight: 1.7,
  marginBottom: vars.space.xl,
})

// ============================================
// GRID
// ============================================

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: vars.space.xl,
  marginTop: vars.space['2xl'],
})

export const card = style({
  padding: vars.space.xl,
  background: 'rgba(255, 255, 255, 0.02)',
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.lg,
  transition: `all ${vars.duration.base}`,
  ':hover': {
    background: 'rgba(59, 130, 246, 0.05)',
    borderColor: vars.color.border,
    transform: 'translateY(-4px)',
  },
})

export const cardTitle = style({
  fontFamily: vars.font.display,
  fontSize: '1.35rem',
  color: vars.color.text,
  marginBottom: vars.space.sm,
})

export const cardText = style({
  fontFamily: vars.font.body,
  fontSize: '0.95rem',
  color: vars.color.textSecondary,
  lineHeight: 1.6,
})

// ============================================
// FOUNDER
// ============================================

export const founder = style({
  display: 'flex',
  gap: vars.space['2xl'],
  alignItems: 'flex-start',
  '@media': {
    '(max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    },
  },
})

export const founderPhoto = style({
  width: '140px',
  height: '140px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: `3px solid ${vars.color.border}`,
  flexShrink: 0,
})

export const founderInfo = style({
  flex: 1,
})

// ============================================
// LINK BOX
// ============================================

export const linkBox = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  padding: `${vars.space.lg} ${vars.space.xl}`,
  background: 'rgba(59, 130, 246, 0.05)',
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  fontFamily: vars.font.body,
  fontSize: '1rem',
  color: vars.color.textSecondary,
})

export const checkIcon = style({
  width: '20px',
  height: '20px',
  color: vars.color.success,
  flexShrink: 0,
})

export const link = style({
  color: vars.color.precision,
  textDecoration: 'none',
  fontWeight: 500,
  transition: `color ${vars.duration.fast}`,
  ':hover': {
    color: vars.color.warmth,
  },
})

// ============================================
// CONTACT
// ============================================

export const contactBox = style({
  textAlign: 'center',
  padding: vars.space['2xl'],
  background: `linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%)`,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.xl,
  marginTop: vars.space.xl,
})

export const contactLink = style({
  fontFamily: vars.font.mono,
  fontSize: '1.25rem',
  color: vars.color.precision,
  textDecoration: 'none',
  fontWeight: 500,
  transition: `all ${vars.duration.base}`,
  ':hover': {
    color: vars.color.warmth,
    textDecoration: 'underline',
  },
})
