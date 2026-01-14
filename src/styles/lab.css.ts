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
  maxWidth: '1400px',
  margin: '0 auto',
  padding: `${vars.space['3xl']} ${vars.space.xl}`,
})

// ============================================
// PAGE TITLE SECTION
// ============================================

export const pageHeader = style({
  marginBottom: vars.space['3xl'],
  paddingTop: vars.space['4xl'],  // Space for fixed nav header
})

export const headerTop = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.lg,
  marginBottom: vars.space.lg,
})

export const labBadge = style({
  padding: `${vars.space.sm} ${vars.space.lg}`,
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
  border: `1px solid ${vars.color.precision}`,
  borderRadius: '100px',
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  fontWeight: 600,
  color: vars.color.precision,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
})

export const headerTitle = style({
  fontFamily: vars.font.display,
  fontSize: 'clamp(2rem, 4vw, 2.5rem)',
  fontWeight: 400,
  color: vars.color.text,
  margin: 0,
})

export const headerMeta = style({
  display: 'flex',
  gap: vars.space.xl,
  flexWrap: 'wrap',
})

export const metaItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
})

export const metaLabel = style({
  fontFamily: vars.font.body,
  fontSize: '0.85rem',
  color: vars.color.textTertiary,
})

export const metaValue = style({
  fontFamily: vars.font.mono,
  fontSize: '0.9rem',
  fontWeight: 600,
  color: vars.color.text,
})

// ============================================
// TABS
// ============================================

export const tabs = style({
  display: 'flex',
  gap: vars.space.xs,
  marginBottom: vars.space['2xl'],
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  overflowX: 'auto',
})

export const tab = style({
  padding: `${vars.space.md} ${vars.space.xl}`,
  background: 'transparent',
  border: 'none',
  borderBottom: '2px solid transparent',
  fontFamily: vars.font.body,
  fontSize: '0.9rem',
  fontWeight: 500,
  color: vars.color.textSecondary,
  cursor: 'pointer',
  transition: `all ${vars.duration.fast}`,
  whiteSpace: 'nowrap',
  ':hover': {
    color: vars.color.text,
    background: 'rgba(59, 130, 246, 0.05)',
  },
})

export const tabActive = style({
  color: vars.color.precision,
  borderBottomColor: vars.color.precision,
})

// ============================================
// DATA STATUS BANNERS
// ============================================

export const statusBanner = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.lg,
  padding: `${vars.space.lg} ${vars.space.xl}`,
  borderRadius: vars.radius.lg,
  marginBottom: vars.space.xl,
  fontFamily: vars.font.body,
  fontSize: '0.95rem',
  fontWeight: 600,
})

export const statusBannerLoading = style({
  background: 'linear-gradient(135deg, #00d4ff 0%, #0088cc 100%)',
  color: 'white',
})

export const statusBannerMock = style({
  background: 'linear-gradient(135deg, #ff4466 0%, #ff6b35 100%)',
  color: 'white',
  boxShadow: '0 4px 20px rgba(255, 68, 102, 0.4)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
})

export const statusBannerWarning = style({
  background: 'linear-gradient(135deg, #ffaa00 0%, #ff8800 100%)',
  color: vars.color.void,
  boxShadow: '0 4px 20px rgba(255, 170, 0, 0.3)',
  border: '2px solid rgba(255, 255, 255, 0.3)',
})

export const statusBannerSuccess = style({
  background: 'linear-gradient(135deg, #00ff88 0%, #00cc66 100%)',
  color: vars.color.void,
  padding: `${vars.space.md} ${vars.space.lg}`,
  fontSize: '0.85rem',
})

export const dataNote = style({
  padding: vars.space.lg,
  background: 'rgba(255, 255, 255, 0.02)',
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.md,
  marginBottom: vars.space['2xl'],
  fontFamily: vars.font.body,
  fontSize: '0.85rem',
  color: vars.color.textSecondary,
  lineHeight: 1.6,
})

export const dataNoteBold = style({
  fontWeight: 600,
  color: vars.color.text,
  marginRight: vars.space.sm,
})

// ============================================
// TABLE SECTION
// ============================================

export const tableSection = style({
  marginBottom: vars.space['3xl'],
})

export const sectionTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  fontFamily: vars.font.display,
  fontSize: '1.5rem',
  color: vars.color.text,
  marginBottom: vars.space.xl,
})

export const sectionCount = style({
  padding: `${vars.space.xs} ${vars.space.md}`,
  background: 'rgba(59, 130, 246, 0.1)',
  borderRadius: '100px',
  fontFamily: vars.font.mono,
  fontSize: '0.8rem',
  fontWeight: 600,
  color: vars.color.precision,
})

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  background: 'rgba(255, 255, 255, 0.01)',
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
})

globalStyle(`${table} th`, {
  padding: `${vars.space.md} ${vars.space.lg}`,
  textAlign: 'left',
  fontFamily: vars.font.body,
  fontSize: '0.75rem',
  fontWeight: 600,
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  background: 'rgba(255, 255, 255, 0.02)',
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
})

globalStyle(`${table} td`, {
  padding: `${vars.space.md} ${vars.space.lg}`,
  fontFamily: vars.font.body,
  fontSize: '0.9rem',
  color: vars.color.textSecondary,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
})

globalStyle(`${table} tr:hover`, {
  background: 'rgba(59, 130, 246, 0.03)',
})

globalStyle(`${table} tr:last-child td`, {
  borderBottom: 'none',
})

export const citationCell = style({
  fontWeight: 500,
  color: `${vars.color.text} !important`,
})

export const timestampCell = style({
  fontFamily: vars.font.mono,
  fontSize: '0.8rem !important',
  color: `${vars.color.textTertiary} !important`,
})

export const durationCell = style({
  fontFamily: vars.font.mono,
  fontSize: '0.8rem !important',
})

export const scoreCell = style({
  fontFamily: vars.font.mono,
  fontWeight: 600,
  textAlign: 'center !important' as 'center',
})

export const scoreGood = style({
  color: '#00ff88 !important',
})

export const scoreWarn = style({
  color: '#ffaa00 !important',
})

export const scoreBad = style({
  color: '#ff4466 !important',
})

export const iterationBadge = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  fontWeight: 600,
})

export const iterationSuccess = style({
  background: 'rgba(0, 255, 136, 0.15)',
  color: '#00ff88',
})

export const iterationFailed = style({
  background: 'rgba(255, 68, 102, 0.15)',
  color: '#ff4466',
})

export const errorTag = style({
  display: 'inline-block',
  padding: `2px ${vars.space.sm}`,
  background: 'rgba(255, 68, 102, 0.15)',
  borderRadius: vars.radius.sm,
  fontFamily: vars.font.mono,
  fontSize: '0.7rem',
  fontWeight: 600,
  color: '#ff4466',
})

export const sourceBadge = style({
  display: 'inline-block',
  padding: `2px ${vars.space.sm}`,
  borderRadius: vars.radius.sm,
  fontSize: '0.7rem',
  fontWeight: 600,
})

// ============================================
// DETAIL PANEL (inline expanded row)
// ============================================

export const detailPanel = style({
  background: 'rgba(0, 212, 255, 0.03)',
  border: `1px solid rgba(0, 212, 255, 0.2)`,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
})

export const detailHeader = style({
  padding: `${vars.space.lg} ${vars.space.xl}`,
  background: 'rgba(0, 212, 255, 0.08)',
  borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})

export const detailSection = style({
  padding: vars.space.xl,
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
})

export const detailSectionTitle = style({
  fontFamily: vars.font.body,
  fontSize: '0.75rem',
  fontWeight: 600,
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: vars.space.md,
})

export const scoresGrid = style({
  display: 'flex',
  gap: vars.space.xl,
})

export const scoreItem = style({
  textAlign: 'center' as const,
})

export const scoreValue = style({
  fontFamily: vars.font.mono,
  fontSize: '1.5rem',
  fontWeight: 700,
})

export const scoreLabel = style({
  fontFamily: vars.font.body,
  fontSize: '0.7rem',
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
})

export const metaGrid = style({
  display: 'flex',
  gap: vars.space['2xl'],
  flexWrap: 'wrap',
})

export const metaBlock = style({})

globalStyle(`${metaBlock} > div:first-child`, {
  fontFamily: vars.font.body,
  fontSize: '0.7rem',
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  marginBottom: vars.space.xs,
})

globalStyle(`${metaBlock} > div:last-child`, {
  fontFamily: vars.font.mono,
  fontSize: '0.9rem',
  fontWeight: 600,
})

// ============================================
// TRANSCRIPTS
// ============================================

export const transcriptList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.lg,
})

export const transcriptCard = style({
  background: 'rgba(255, 255, 255, 0.02)',
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
})

export const transcriptHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: vars.space.lg,
  cursor: 'pointer',
  transition: `background ${vars.duration.fast}`,
  ':hover': {
    background: 'rgba(0, 212, 255, 0.03)',
  },
})

export const transcriptHeaderExpanded = style({
  background: 'rgba(0, 212, 255, 0.05)',
})

export const transcriptBadge = style({
  padding: `${vars.space.xs} ${vars.space.md}`,
  background: 'rgba(0, 212, 255, 0.15)',
  borderRadius: vars.radius.sm,
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#00d4ff',
})

export const transcriptMeta = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.lg,
})

export const transcriptContent = style({
  borderTop: `1px solid ${vars.color.borderSubtle}`,
})

export const orchestratorThinking = style({
  padding: vars.space.lg,
  background: 'rgba(139, 92, 246, 0.05)',
  borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
})

export const timelineControls = style({
  padding: `${vars.space.md} ${vars.space.lg}`,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})

export const timeline = style({
  padding: vars.space.lg,
  maxHeight: '600px',
  overflow: 'auto',
})

export const timelineEvent = style({
  marginBottom: vars.space.md,
  borderRadius: vars.radius.md,
  overflow: 'hidden',
})

export const timelineEventHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: `${vars.space.sm} ${vars.space.md}`,
})

export const timelineEventContent = style({
  padding: `${vars.space.sm} ${vars.space.md}`,
})

// ============================================
// SDK SESSIONS
// ============================================

export const sessionList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
})

export const sessionCard = style({
  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.03) 0%, rgba(0, 255, 136, 0.02) 100%)',
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xl,
  padding: `${vars.space.xl} ${vars.space['2xl']}`,
  cursor: 'pointer',
  transition: `all ${vars.duration.fast}`,
  position: 'relative',
  overflow: 'hidden',
  ':hover': {
    borderColor: 'rgba(0, 212, 255, 0.3)',
    transform: 'translateY(-2px)',
  },
})

export const sessionGlow = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '2px',
  background: 'linear-gradient(90deg, #00d4ff, #00ff88, #a78bfa)',
  opacity: 0.6,
})

export const sessionHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: vars.space.lg,
})

export const sessionBadge = style({
  background: 'linear-gradient(135deg, #00d4ff 0%, #0088cc 100%)',
  color: vars.color.void,
  padding: `${vars.space.xs} ${vars.space.md}`,
  borderRadius: '100px',
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
})

export const sessionId = style({
  fontFamily: vars.font.mono,
  fontSize: '1rem',
  fontWeight: 600,
  color: '#00ff88',
})

export const sessionStats = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
  gap: vars.space.lg,
})

export const sessionStat = style({})

globalStyle(`${sessionStat} > div:first-child`, {
  fontSize: '0.65rem',
  color: vars.color.textTertiary,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: vars.space.xs,
})

globalStyle(`${sessionStat} > div:last-child`, {
  fontFamily: vars.font.mono,
  fontSize: '1rem',
  fontWeight: 600,
})

// ============================================
// PLUGIN CONTENT
// ============================================

export const pluginGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: vars.space.xl,
})

export const pluginCategory = style({
  background: 'rgba(255, 255, 255, 0.02)',
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.xl,
  padding: vars.space.xl,
})

export const pluginCategoryTitle = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.sm,
  fontFamily: vars.font.display,
  fontSize: '1.1rem',
  color: vars.color.text,
  marginBottom: vars.space.lg,
  paddingBottom: vars.space.md,
  borderBottom: `1px solid ${vars.color.borderSubtle}`,
})

export const pluginItem = style({
  padding: vars.space.md,
  marginBottom: vars.space.sm,
  background: 'rgba(255, 255, 255, 0.02)',
  border: `1px solid ${vars.color.borderSubtle}`,
  borderRadius: vars.radius.md,
  cursor: 'pointer',
  transition: `all ${vars.duration.fast}`,
  ':hover': {
    borderColor: vars.color.border,
    background: 'rgba(59, 130, 246, 0.05)',
  },
})

export const pluginItemHeader = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: vars.space.xs,
})

export const pluginItemName = style({
  fontFamily: vars.font.mono,
  fontSize: '0.9rem',
  fontWeight: 600,
  color: vars.color.text,
})

export const pluginItemLines = style({
  fontFamily: vars.font.mono,
  fontSize: '0.75rem',
  color: vars.color.textTertiary,
})

export const pluginItemDesc = style({
  fontFamily: vars.font.body,
  fontSize: '0.8rem',
  color: vars.color.textSecondary,
  lineHeight: 1.5,
})

export const pluginItemExpanded = style({
  marginTop: vars.space.md,
  padding: vars.space.md,
  background: vars.color.void,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.borderSubtle}`,
})

// ============================================
// KNOWN ISSUES
// ============================================

export const issuesList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.lg,
})

export const issueCard = style({
  background: 'rgba(255, 170, 0, 0.03)',
  border: '1px solid rgba(255, 170, 0, 0.2)',
  borderRadius: vars.radius.xl,
  overflow: 'hidden',
})

export const issueHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
  padding: `${vars.space.lg} ${vars.space.xl}`,
  background: 'rgba(255, 170, 0, 0.08)',
  borderBottom: '1px solid rgba(255, 170, 0, 0.15)',
})

export const issueIcon = style({
  fontSize: '1.25rem',
})

export const issueTitle = style({
  fontFamily: vars.font.display,
  fontSize: '1rem',
  fontWeight: 500,
  color: '#ffaa00',
})

export const issueContent = style({
  padding: vars.space.xl,
})

globalStyle(`${issueContent} p`, {
  fontFamily: vars.font.body,
  fontSize: '0.95rem',
  color: vars.color.textSecondary,
  lineHeight: 1.6,
  margin: 0,
})

globalStyle(`${issueContent} strong`, {
  color: vars.color.text,
})

globalStyle(`${issueContent} code`, {
  fontFamily: vars.font.mono,
  fontSize: '0.85rem',
  padding: '2px 6px',
  background: 'rgba(255, 170, 0, 0.15)',
  borderRadius: '4px',
  color: '#ffaa00',
})

// ============================================
// EMPTY STATE
// ============================================

export const emptyState = style({
  padding: `${vars.space['4xl']} ${vars.space['2xl']}`,
  textAlign: 'center' as const,
  background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.03) 0%, transparent 100%)',
  borderRadius: vars.radius.xl,
  border: '1px dashed rgba(0, 212, 255, 0.2)',
})

export const emptyStateIcon = style({
  marginBottom: vars.space.xl,
  opacity: 0.6,
  color: vars.color.precision,
})

export const emptyStateTitle = style({
  fontFamily: vars.font.display,
  fontSize: '1.25rem',
  color: vars.color.text,
  marginBottom: vars.space.sm,
})

export const emptyStateDesc = style({
  fontFamily: vars.font.body,
  fontSize: '0.9rem',
  color: vars.color.textTertiary,
})
