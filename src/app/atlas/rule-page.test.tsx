import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const mockPush = vi.fn()

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
  usePathname: () => '/atlas/rule-1',
}))

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock useRule hook
vi.mock('@/hooks/use-rules', () => ({
  useRule: vi.fn(),
}))

// Mock useEncoding hook
vi.mock('@/hooks/use-encoding', () => ({
  useEncoding: vi.fn().mockReturnValue({
    encoding: null,
    sessionEvents: [],
    loading: false,
    error: null,
  }),
}))

import { useRule } from '@/hooks/use-rules'
import { useEncoding } from '@/hooks/use-encoding'
import { RuleViewer } from './[ruleId]/rule-viewer'
import { transformRuleToViewerDoc } from '@/lib/atlas-utils'
import type { Rule } from '@/lib/supabase'

function makeRule(overrides: Partial<Rule> = {}): Rule {
  return {
    id: 'rule-1',
    jurisdiction: 'us',
    doc_type: 'statute',
    parent_id: null,
    level: 0,
    ordinal: 1,
    heading: 'Section 1 - Tax imposed',
    body: null,
    effective_date: null,
    repeal_date: null,
    source_url: null,
    source_path: 'statute/26/1',
    citation_path: 'us/statute/26/1',
    rac_path: null,
    has_rac: true,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
    ...overrides,
  }
}

describe('transformRuleToViewerDoc', () => {
  it('creates subsections from children', () => {
    const rule = makeRule()
    const children = [
      makeRule({ id: 'c1', body: 'Child 1 text', heading: null }),
      makeRule({ id: 'c2', body: null, heading: 'Child 2 heading' }),
      makeRule({ id: 'c3', body: null, heading: null }),
    ]
    const doc = transformRuleToViewerDoc(rule, children)
    expect(doc.subsections).toEqual([
      { id: 'a', text: 'Child 1 text' },
      { id: 'b', text: 'Child 2 heading' },
      { id: 'c', text: '' },
    ])
    expect(doc.title).toBe('Section 1 - Tax imposed')
    expect(doc.citation).toBe('statute/26/1')
  })

  it('splits body into paragraphs when no children', () => {
    const rule = makeRule({ body: 'Paragraph one.\n\nParagraph two.' })
    const doc = transformRuleToViewerDoc(rule, [])
    expect(doc.subsections).toEqual([
      { id: 'a', text: 'Paragraph one.' },
      { id: 'b', text: 'Paragraph two.' },
    ])
  })

  it('uses heading fallback when no body and no children', () => {
    const rule = makeRule({ body: null })
    const doc = transformRuleToViewerDoc(rule, [])
    expect(doc.subsections).toEqual([
      { id: 'a', text: 'Section 1 - Tax imposed' },
    ])
  })

  it('uses "No content available." when no heading, body, or children', () => {
    const rule = makeRule({ heading: null, body: null })
    const doc = transformRuleToViewerDoc(rule, [])
    expect(doc.subsections).toEqual([
      { id: 'a', text: 'No content available.' },
    ])
    expect(doc.title).toBe('Untitled')
  })

  it('uses rule.id as citation when source_path is null', () => {
    const rule = makeRule({ source_path: null })
    const doc = transformRuleToViewerDoc(rule, [])
    expect(doc.citation).toBe('rule-1')
  })

  it('passes hasRac, jurisdiction, and archPath', () => {
    const rule = makeRule({ has_rac: true, jurisdiction: 'uk', source_path: 'statute/uk/1' })
    const doc = transformRuleToViewerDoc(rule, [])
    expect(doc.hasRac).toBe(true)
    expect(doc.jurisdiction).toBe('uk')
    expect(doc.archPath).toBe('statute/uk/1')
  })
})

describe('RuleViewer', () => {
  it('shows loading state', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: null,
      children: [],
      loading: true,
      error: null,
    })

    render(<RuleViewer ruleId="rule-1" />)
    expect(screen.getByText('Loading rule...')).toBeInTheDocument()
  })

  it('shows error state with back button', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: null,
      children: [],
      loading: false,
      error: 'Rule not found',
    })

    render(<RuleViewer ruleId="bad-id" />)
    expect(screen.getByText('Rule not found')).toBeInTheDocument()
    expect(screen.getByText('Back to Atlas')).toBeInTheDocument()
  })

  it('shows not found when no rule and no error', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: null,
      children: [],
      loading: false,
      error: null,
    })

    render(<RuleViewer ruleId="bad-id" />)
    expect(screen.getByText('Rule not found.')).toBeInTheDocument()
  })

  it('navigates to /atlas on back button click', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: null,
      children: [],
      loading: false,
      error: 'Error',
    })

    render(<RuleViewer ruleId="rule-1" />)
    fireEvent.click(screen.getByText('Back to Atlas'))
    expect(mockPush).toHaveBeenCalledWith('/atlas')
  })

  it('renders rule detail panel when rule is loaded', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: makeRule(),
      children: [],
      loading: false,
      error: null,
    })

    render(<RuleViewer ruleId="rule-1" />)
    expect(screen.getAllByText('Section 1 - Tax imposed').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('statute/26/1').length).toBeGreaterThanOrEqual(1)
  })

  it('renders with children as subsections', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: makeRule(),
      children: [
        makeRule({ id: 'c1', body: 'In general, there is imposed a tax.', heading: null }),
      ],
      loading: false,
      error: null,
    })

    render(<RuleViewer ruleId="rule-1" />)
    expect(screen.getByText('In general, there is imposed a tax.')).toBeInTheDocument()
  })

  it('navigates to /atlas when back button is clicked', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: makeRule(),
      children: [],
      loading: false,
      error: null,
    })

    render(<RuleViewer ruleId="rule-1" />)
    const backBtn = screen.getByTitle('Back to browser')
    fireEvent.click(backBtn)
    expect(mockPush).toHaveBeenCalledWith('/atlas')
  })

  it('shows encoding tab indicator when encoding exists', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: makeRule(),
      children: [],
      loading: false,
      error: null,
    })
    vi.mocked(useEncoding).mockReturnValue({
      encoding: {
        encoding_run_id: 'enc-1',
        citation: '26 USC 1',
        session_id: 'sess-1',
        file_path: 'statute/26/1.rac',
        rac_content: 'rule { ... }',
        final_scores: { rac: 90, formula: 85, parameter: 80, integration: 75 },
      },
      sessionEvents: [{
        id: 'evt-1',
        session_id: 'sess-1',
        sequence: 1,
        timestamp: '2025-01-01T10:00:00Z',
        event_type: 'agent_start',
        tool_name: null,
        content: 'Start',
        metadata: null,
      }],
      loading: false,
      error: null,
    })

    render(<RuleViewer ruleId="rule-1" />)
    // Tab bar should show encoding and agent logs tabs
    expect(screen.getByText('Encoding')).toBeInTheDocument()
    expect(screen.getByText('Agent logs')).toBeInTheDocument()
  })

  it('switches to encoding tab and shows content', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: makeRule(),
      children: [],
      loading: false,
      error: null,
    })
    vi.mocked(useEncoding).mockReturnValue({
      encoding: {
        encoding_run_id: 'enc-1',
        citation: '26 USC 1',
        session_id: null,
        file_path: 'statute/26/1.rac',
        rac_content: 'rule tax_imposed { ... }',
        final_scores: { rac: 90, formula: 85, parameter: 80, integration: 75 },
      },
      sessionEvents: [],
      loading: false,
      error: null,
    })

    render(<RuleViewer ruleId="rule-1" />)
    fireEvent.click(screen.getByText('Encoding'))
    expect(screen.getByText('26 USC 1')).toBeInTheDocument()
    expect(screen.getByText('rule tax_imposed { ... }')).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
  })

  it('switches to agent logs tab and shows empty state', () => {
    vi.mocked(useRule).mockReturnValue({
      rule: makeRule(),
      children: [],
      loading: false,
      error: null,
    })
    vi.mocked(useEncoding).mockReturnValue({
      encoding: null,
      sessionEvents: [],
      loading: false,
      error: null,
    })

    render(<RuleViewer ruleId="rule-1" />)
    fireEvent.click(screen.getByText('Agent logs'))
    expect(screen.getByText('No sessions')).toBeInTheDocument()
  })
})
