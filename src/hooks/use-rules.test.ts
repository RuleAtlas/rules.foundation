import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase with hoisted functions
const { mockFrom, mockSelect, mockOrder, mockRange, mockEq, mockIs, mockSingle, mockLimit } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockLimit = vi.fn()
  const mockRange = vi.fn()
  const mockEq = vi.fn()
  const mockIs = vi.fn()
  const mockOrder = vi.fn()
  const mockSelect = vi.fn()
  const mockFrom = vi.fn()

  // Set up chain
  mockSingle.mockResolvedValue({ data: null, error: null })
  mockLimit.mockResolvedValue({ data: [], error: null, count: 0 })
  mockRange.mockResolvedValue({ data: [], error: null, count: 0 })
  mockEq.mockReturnValue({ order: mockOrder, single: mockSingle })
  mockIs.mockReturnValue({ order: mockOrder })
  mockOrder.mockReturnValue({ order: mockOrder, range: mockRange, limit: mockLimit, eq: mockEq, is: mockIs })
  mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, is: mockIs, range: mockRange, count: 0 })
  mockFrom.mockReturnValue({ select: mockSelect })

  return { mockFrom, mockSelect, mockOrder, mockRange, mockEq, mockIs, mockSingle, mockLimit }
})

vi.mock('@/lib/supabase', () => ({
  supabaseArch: {
    from: mockFrom,
  },
}))

import { useRules, useRule } from './use-rules'

describe('useRules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset chain
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 })
    mockEq.mockReturnValue({ order: mockOrder, textSearch: vi.fn().mockReturnValue({ range: mockRange }) })
    mockIs.mockReturnValue({ order: mockOrder })
    mockOrder.mockReturnValue({ order: mockOrder, range: mockRange, is: mockIs, eq: mockEq })
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq, is: mockIs, range: mockRange })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('fetches rules on mount', async () => {
    const mockData = [{ id: 'r1', heading: 'Rule 1', jurisdiction: 'us' }]
    mockRange.mockResolvedValue({ data: mockData, error: null, count: 1 })

    const { result } = renderHook(() => useRules())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rules).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch error', async () => {
    mockRange.mockResolvedValue({ data: null, error: { message: 'Network error' }, count: 0 })

    const { result } = renderHook(() => useRules())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch rules')
  })

  it('computes hasMore correctly', async () => {
    mockRange.mockResolvedValue({
      data: Array.from({ length: 50 }, (_, i) => ({ id: `r${i}` })),
      error: null,
      count: 100,
    })

    const { result } = renderHook(() => useRules())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.hasMore).toBe(true)
  })

  it('fetches stats for all jurisdictions', async () => {
    mockRange.mockResolvedValue({ data: [], error: null, count: 0 })

    const { result } = renderHook(() => useRules())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // Stats are fetched via select/eq for each jurisdiction
    expect(mockFrom).toHaveBeenCalled()
  })
})

describe('useRule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockLimit.mockResolvedValue({ data: [], error: null })
    mockEq.mockReturnValue({ order: mockOrder, single: mockSingle })
    mockOrder.mockReturnValue({ order: mockOrder, range: mockRange, limit: mockLimit, eq: mockEq })
    mockSelect.mockReturnValue({ order: mockOrder, eq: mockEq })
    mockFrom.mockReturnValue({ select: mockSelect })
  })

  it('fetches rule and children by id', async () => {
    const mockRule = { id: 'r1', heading: 'Title 26', jurisdiction: 'us' }
    const mockChildren = [{ id: 'r1-a', heading: 'Section A' }]

    // First call returns the rule, second returns children
    let callCount = 0
    mockFrom.mockImplementation(() => {
      callCount++
      if (callCount <= 1) {
        return {
          select: () => ({
            eq: () => ({
              single: vi.fn().mockResolvedValue({ data: mockRule, error: null }),
            }),
          }),
        }
      }
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              data: mockChildren,
              error: null,
              then: (fn: any) => fn({ data: mockChildren, error: null }),
            }),
          }),
        }),
      }
    })

    // Use a simpler approach: just mock the resolved values
    mockSingle.mockResolvedValue({ data: mockRule, error: null })
    mockOrder.mockResolvedValue({ data: mockChildren, error: null })
    mockFrom.mockReturnValue({ select: mockSelect })
    mockSelect.mockReturnValue({ eq: mockEq })
    mockEq.mockReturnValue({ single: mockSingle, order: mockOrder })

    const { result } = renderHook(() => useRule('r1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rule).toEqual(mockRule)
    expect(result.current.children).toEqual(mockChildren)
  })

  it('returns null when id is null', async () => {
    const { result } = renderHook(() => useRule(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.rule).toBeNull()
    expect(result.current.children).toEqual([])
  })

  it('handles fetch error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'Not found' } })

    const { result } = renderHook(() => useRule('bad-id'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('Failed to fetch rule')
  })
})
