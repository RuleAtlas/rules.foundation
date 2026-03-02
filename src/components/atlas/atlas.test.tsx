import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/atlas',
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}))

// Mock motion/react to avoid animation issues in tests
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock Supabase with hoisted functions
const { mockFrom, mockSelect, mockOrder, mockRange, mockEq, mockIs, mockTextSearch, mockLimit } = vi.hoisted(() => {
  const mockLimit = vi.fn()
  const mockRange = vi.fn()
  const mockEq = vi.fn()
  const mockIs = vi.fn()
  const mockTextSearch = vi.fn()
  const mockOrder = vi.fn()
  const mockSelect = vi.fn()
  const mockFrom = vi.fn()

  // Chain them so each returns the next
  mockLimit.mockResolvedValue({ data: [], error: null, count: 0 })
  mockRange.mockReturnValue({ data: [], error: null, count: 0 })
  mockTextSearch.mockReturnValue({ range: mockRange })
  mockEq.mockReturnValue({ order: mockOrder, textSearch: mockTextSearch, range: mockRange })
  mockIs.mockReturnValue({ order: mockOrder, eq: mockEq, textSearch: mockTextSearch, range: mockRange })
  mockOrder.mockReturnValue({ order: mockOrder, range: mockRange, limit: mockLimit, is: mockIs, eq: mockEq })
  mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, is: mockIs, range: mockRange, limit: mockLimit, count: 0, data: [], error: null })
  mockFrom.mockReturnValue({ select: mockSelect })

  return { mockFrom, mockSelect, mockOrder, mockRange, mockEq, mockIs, mockTextSearch, mockLimit }
})

vi.mock('@/lib/supabase', () => ({
  supabaseArch: {
    from: mockFrom,
  },
  supabase: {
    from: mockFrom,
  },
}))

import { DocumentViewer } from './document-viewer'
import { RuleTree } from './rule-tree'
import { AtlasBrowser } from './document-browser'

describe('DocumentViewer', () => {
  const mockDoc = {
    citation: '26 USC 1',
    title: 'Tax imposed',
    subsections: [
      { id: 'a', text: 'There is hereby imposed a tax.' },
      { id: 'b', text: 'The amount of tax shall be determined.' },
    ],
    hasRac: true,
    jurisdiction: 'us',
    archPath: 'statute/26/1.json',
  }

  it('renders document title and citation', () => {
    render(<DocumentViewer document={mockDoc} />)
    expect(screen.getByText('Tax imposed')).toBeInTheDocument()
    expect(screen.getByText('26 USC 1')).toBeInTheDocument()
  })

  it('renders all subsections', () => {
    render(<DocumentViewer document={mockDoc} />)
    expect(screen.getByText('There is hereby imposed a tax.')).toBeInTheDocument()
    expect(screen.getByText('The amount of tax shall be determined.')).toBeInTheDocument()
    expect(screen.getByText('(a)')).toBeInTheDocument()
    expect(screen.getByText('(b)')).toBeInTheDocument()
  })

  it('renders jurisdiction badge as US', () => {
    render(<DocumentViewer document={mockDoc} />)
    expect(screen.getByText('US')).toBeInTheDocument()
  })

  it('renders UK jurisdiction label', () => {
    render(<DocumentViewer document={{ ...mockDoc, jurisdiction: 'uk' }} />)
    expect(screen.getByText('UK')).toBeInTheDocument()
  })

  it('renders Canada jurisdiction label', () => {
    render(<DocumentViewer document={{ ...mockDoc, jurisdiction: 'canada' }} />)
    expect(screen.getByText('CA')).toBeInTheDocument()
  })

  it('renders state jurisdiction label from us- prefix', () => {
    render(<DocumentViewer document={{ ...mockDoc, jurisdiction: 'us-ny' }} />)
    expect(screen.getByText('NY')).toBeInTheDocument()
  })

  it('renders source path when present', () => {
    render(<DocumentViewer document={mockDoc} />)
    expect(screen.getByText('statute/26/1.json')).toBeInTheDocument()
  })

  it('does not render source section when archPath is null', () => {
    render(<DocumentViewer document={{ ...mockDoc, archPath: null }} />)
    expect(screen.queryByText('Source:')).not.toBeInTheDocument()
  })

  it('shows status bar with subsection count and RAC status', () => {
    render(<DocumentViewer document={mockDoc} />)
    expect(screen.getByText('2 subsections | RAC available')).toBeInTheDocument()
    expect(screen.getByText('Connected to Atlas')).toBeInTheDocument()
  })

  it('shows subsection count without RAC when not available', () => {
    render(<DocumentViewer document={{ ...mockDoc, hasRac: false }} />)
    expect(screen.getByText('2 subsections')).toBeInTheDocument()
  })

  it('shows back button when onBack is provided', () => {
    const onBack = vi.fn()
    render(<DocumentViewer document={mockDoc} onBack={onBack} />)
    const backBtn = screen.getByTitle('Back to browser')
    fireEvent.click(backBtn)
    expect(onBack).toHaveBeenCalled()
  })

  it('does not show back button when onBack is not provided', () => {
    render(<DocumentViewer document={mockDoc} />)
    expect(screen.queryByTitle('Back to browser')).not.toBeInTheDocument()
  })

  it('highlights subsection on hover', () => {
    render(<DocumentViewer document={mockDoc} />)
    const subsection = screen.getByText('There is hereby imposed a tax.')
    const container = subsection.closest('div[class*="transition"]')!
    fireEvent.mouseEnter(container)
    expect(container).toHaveClass('bg-[rgba(59,130,246,0.08)]')
    fireEvent.mouseLeave(container)
    expect(container).not.toHaveClass('bg-[rgba(59,130,246,0.08)]')
  })
})

describe('RuleTree', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset chain after clearing
    mockLimit.mockResolvedValue({ data: [], error: null, count: 0 })
    mockRange.mockReturnValue({ data: [], error: null, count: 0 })
    mockEq.mockReturnValue({ order: mockOrder })
    mockIs.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ order: mockOrder, range: mockRange, limit: mockLimit })
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, is: mockIs, range: mockRange, limit: mockLimit })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  const mockRules = [
    {
      id: 'rule-1',
      jurisdiction: 'us',
      doc_type: 'statute',
      parent_id: null,
      level: 0,
      ordinal: 1,
      heading: 'Title 26 - Internal Revenue Code',
      body: null,
      effective_date: null,
      repeal_date: null,
      source_url: null,
      source_path: 'statute/26',
      citation_path: null,
      rac_path: null,
      has_rac: false,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
    {
      id: 'rule-2',
      jurisdiction: 'uk',
      doc_type: 'statute',
      parent_id: null,
      level: 0,
      ordinal: 2,
      heading: 'Income Tax Act 2007',
      body: null,
      effective_date: null,
      repeal_date: null,
      source_url: null,
      source_path: 'statute/ita2007',
      citation_path: null,
      rac_path: null,
      has_rac: false,
      created_at: '2025-01-01',
      updated_at: '2025-01-01',
    },
  ]

  it('renders rule items with jurisdiction labels', () => {
    render(<RuleTree rules={mockRules} onSelect={vi.fn()} />)
    expect(screen.getByText('Title 26 - Internal Revenue Code')).toBeInTheDocument()
    expect(screen.getByText('Income Tax Act 2007')).toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
    expect(screen.getByText('UK')).toBeInTheDocument()
  })

  it('renders source paths', () => {
    render(<RuleTree rules={mockRules} onSelect={vi.fn()} />)
    expect(screen.getByText('statute/26')).toBeInTheDocument()
    expect(screen.getByText('statute/ita2007')).toBeInTheDocument()
  })

  it('calls onSelect when a rule is clicked', () => {
    const onSelect = vi.fn()
    render(<RuleTree rules={mockRules} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Title 26 - Internal Revenue Code'))
    expect(onSelect).toHaveBeenCalledWith(mockRules[0])
  })

  it('renders truncated id when source_path is null', () => {
    const rules = [{
      ...mockRules[0],
      source_path: null,
      id: 'abcdefghij',
    }]
    render(<RuleTree rules={rules} onSelect={vi.fn()} />)
    expect(screen.getByText('abcdefgh')).toBeInTheDocument()
  })

  it('renders "(no heading)" when heading is null', () => {
    const rules = [{ ...mockRules[0], heading: null }]
    render(<RuleTree rules={rules} onSelect={vi.fn()} />)
    expect(screen.getByText('(no heading)')).toBeInTheDocument()
  })
})

describe('AtlasBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLimit.mockResolvedValue({ data: [], error: null, count: 0 })
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 })
    mockEq.mockReturnValue({ order: mockOrder, textSearch: mockTextSearch, range: mockRange })
    mockIs.mockReturnValue({ order: mockOrder, eq: mockEq, textSearch: mockTextSearch, range: mockRange })
    mockOrder.mockReturnValue({ order: mockOrder, range: mockRange, limit: mockLimit, is: mockIs, eq: mockEq })
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, is: mockIs, range: mockRange, limit: mockLimit, count: 0, data: [], error: null })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('renders atlas header and search', () => {
    render(<AtlasBrowser />)
    expect(screen.getByText('Atlas')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search statutes...')).toBeInTheDocument()
  })

  it('renders jurisdiction filter buttons', () => {
    render(<AtlasBrowser />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'US' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'UK' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Canada' })).toBeInTheDocument()
  })

  it('shows "No rules found" when empty', async () => {
    render(<AtlasBrowser />)
    await waitFor(() => {
      expect(screen.getByText('No rules found.')).toBeInTheDocument()
    })
  })

  it('shows description text', () => {
    render(<AtlasBrowser />)
    expect(screen.getByText(/browse the legal document archive/i)).toBeInTheDocument()
  })

  it('filters by jurisdiction on button click', async () => {
    render(<AtlasBrowser />)
    fireEvent.click(screen.getByRole('button', { name: 'US' }))
    // Should trigger re-fetch with jurisdiction filter
    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalled()
    })
  })

  it('updates search input', () => {
    render(<AtlasBrowser />)
    const input = screen.getByPlaceholderText('Search statutes...')
    fireEvent.change(input, { target: { value: 'tax' } })
    expect(input).toHaveValue('tax')
  })
})
