import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

const mockPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, back: vi.fn() }),
}))

vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

vi.mock('@/hooks/use-encoding', () => ({
  useEncoding: vi.fn().mockReturnValue({
    encoding: null,
    sessionEvents: [],
    loading: false,
    error: null,
  }),
}))

import { RulePageClient } from './[ruleId]/rule-page-client'
import type { ViewerDocument } from '@/lib/atlas-utils'
import type { Rule } from '@/lib/supabase'

function makeDoc(): ViewerDocument {
  return {
    citation: '26 USC 1',
    title: 'Tax imposed',
    subsections: [{ id: 'a', text: 'There is a tax.' }],
    hasRac: false,
    jurisdiction: 'us',
    archPath: null,
  }
}

function makeRule(): Rule {
  return {
    id: 'rule-1',
    jurisdiction: 'us',
    doc_type: 'statute',
    parent_id: null,
    level: 0,
    ordinal: 1,
    heading: 'Tax imposed',
    body: null,
    effective_date: null,
    repeal_date: null,
    source_url: null,
    source_path: null,
    citation_path: null,
    rac_path: null,
    has_rac: false,
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  }
}

describe('RulePageClient', () => {
  it('renders rule detail panel with document', () => {
    render(<RulePageClient document={makeDoc()} rule={makeRule()} />)
    expect(screen.getByText('Tax imposed')).toBeInTheDocument()
    expect(screen.getByText('26 USC 1')).toBeInTheDocument()
  })

  it('navigates to /atlas on back button click', () => {
    render(<RulePageClient document={makeDoc()} rule={makeRule()} />)
    const backBtn = screen.getByTitle('Back to browser')
    fireEvent.click(backBtn)
    expect(mockPush).toHaveBeenCalledWith('/atlas')
  })
})
