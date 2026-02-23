import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock all Supabase calls
vi.mock('@/lib/supabase', () => ({
  getSDKSessions: vi.fn().mockResolvedValue([]),
  getSDKSessionEvents: vi.fn().mockResolvedValue([]),
  getSDKSessionMeta: vi.fn().mockResolvedValue({}),
}))

import {
  getSDKSessions,
  getSDKSessionEvents,
  getSDKSessionMeta,
} from '@/lib/supabase'
import type { SDKSession, SDKSessionEvent } from '@/lib/supabase'
import LabPage from '@/app/lab/page'

function mockSession(overrides: Partial<SDKSession> = {}): SDKSession {
  return {
    id: 'sdk-1',
    started_at: '2025-01-01T10:00:00Z',
    ended_at: '2025-01-01T10:30:00Z',
    model: 'claude-3',
    cwd: '/tmp',
    event_count: 100,
    input_tokens: 5000,
    output_tokens: 3000,
    cache_read_tokens: 1000,
    estimated_cost_usd: 1.5,
    ...overrides,
  }
}

function mockEvent(overrides: Partial<SDKSessionEvent> = {}): SDKSessionEvent {
  return {
    id: 'evt-1',
    session_id: 'sdk-1',
    sequence: 1,
    timestamp: '2025-01-01T10:00:05Z',
    event_type: 'message',
    tool_name: null,
    content: 'Some content',
    metadata: null,
    ...overrides,
  }
}

describe('LabPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading and empty states', () => {
    it('shows loading state initially', () => {
      vi.mocked(getSDKSessions).mockReturnValue(new Promise(() => {}))

      render(<LabPage />)
      expect(screen.getByText(/loading sessions/i)).toBeInTheDocument()
    })

    it('shows empty state when no sessions exist', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([])

      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText(/no encoding sessions yet/i)).toBeInTheDocument()
      })
    })
  })

  describe('header stats', () => {
    it('renders page header with aggregate stats', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([
        mockSession({ input_tokens: 5000, output_tokens: 3000, estimated_cost_usd: 1.5 }),
        mockSession({ id: 'sdk-2', input_tokens: 2000, output_tokens: 1000, estimated_cost_usd: 0.75 }),
      ])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})

      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('Encoding lab')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'AutoRAC' })).toBeInTheDocument()
        expect(screen.getByText('2')).toBeInTheDocument()
        expect(screen.getByText('11,000')).toBeInTheDocument()
        expect(screen.getByText('$2.25')).toBeInTheDocument()
      })
    })
  })

  describe('session cards', () => {
    it('renders session card with stats', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession()])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})

      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
        expect(screen.getAllByText('$1.50').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('8,000').length).toBeGreaterThanOrEqual(1)
      })
    })

    it('shows session title from meta when available', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession()])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({
        'sdk-1': { title: '26 USC 137', lastEventAt: null },
      })

      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 137')).toBeInTheDocument()
      })
    })

    it('selects and deselects session on click', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession()])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})
      vi.mocked(getSDKSessionEvents).mockResolvedValue([])

      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))
      await waitFor(() => {
        expect(getSDKSessionEvents).toHaveBeenCalledWith('sdk-1', 2000)
      })

      fireEvent.click(screen.getByText('sdk-1'))
      expect(screen.queryByText(/agent phases/i)).not.toBeInTheDocument()
    })
  })

  describe('detail panel - phases', () => {
    const phaseEvents: SDKSessionEvent[] = [
      mockEvent({ id: 'e1', sequence: 1, event_type: 'agent_start', content: 'Encode section A' }),
      mockEvent({ id: 'e2', sequence: 2, event_type: 'tool_use', tool_name: 'Read', content: 'Reading file.rac' }),
      mockEvent({ id: 'e3', sequence: 3, event_type: 'tool_result', tool_name: 'Read', content: 'File contents here with more text that is quite long and should be truncated when not expanded in the UI to keep things compact' }),
      mockEvent({ id: 'e4', sequence: 4, event_type: 'message', content: 'Analysis complete' }),
      mockEvent({ id: 'e5', sequence: 5, event_type: 'agent_end', content: null }),
      mockEvent({ id: 'e6', sequence: 6, event_type: 'agent_start', content: 'Review encoding' }),
      mockEvent({ id: 'e7', sequence: 7, event_type: 'tool_use', tool_name: 'Write', content: 'Writing output' }),
      mockEvent({ id: 'e8', sequence: 8, event_type: 'agent_end', content: null }),
    ]

    beforeEach(() => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession({ event_count: 8 })])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})
      vi.mocked(getSDKSessionEvents).mockResolvedValue(phaseEvents)
    })

    it('shows phase cards when session is expanded', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText(/agent phases/i)).toBeInTheDocument()
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
        expect(screen.getByText('Phase 2')).toBeInTheDocument()
      })
    })

    it('shows event counts per phase', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('5 events')).toBeInTheDocument()
        expect(screen.getByText('3 events')).toBeInTheDocument()
      })
    })

    it('shows tool usage badges per phase', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getAllByText(/Read/).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('expands phase to show events on click', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      const beforeCount = screen.getAllByText('#1').length

      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        expect(screen.getAllByText('#1').length).toBeGreaterThan(beforeCount)
      })
    })

    it('collapses expanded phase on second click', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        expect(screen.getAllByText('#1').length).toBe(2)
      })

      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        expect(screen.getAllByText('#1').length).toBe(1)
      })
    })

    it('shows event type badges with correct labels in expanded phase', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        expect(screen.getAllByText('agent_start').length).toBeGreaterThan(1)
        expect(screen.getAllByText('tool_use:Read').length).toBeGreaterThan(1)
        expect(screen.getAllByText('tool_result:Read').length).toBeGreaterThan(1)
      })
    })

    it('allows expanding event content within a phase', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        expect(screen.getAllByText(/File contents here/).length).toBeGreaterThan(1)
      })

      const seq3Elements = screen.getAllByText('#3')
      fireEvent.click(seq3Elements[0])

      await waitFor(() => {
        expect(screen.getAllByText(/should be truncated when not expanded/).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('can expand multiple phases independently', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
        expect(screen.getByText('Phase 2')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('Phase 1'))
      fireEvent.click(screen.getByText('Phase 2'))

      await waitFor(() => {
        expect(screen.getAllByText('#1').length).toBe(2)
        expect(screen.getAllByText('#7').length).toBe(2)
      })
    })

    it('shows expand/collapse indicator on phase cards', async () => {
      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      expect(screen.getAllByText('▶').length).toBeGreaterThanOrEqual(2)

      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        expect(screen.getAllByText('▼').length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('event timeline', () => {
    it('shows event timeline with all events', async () => {
      const events = [
        mockEvent({ id: 'e1', sequence: 1, event_type: 'message', content: 'Hello world' }),
        mockEvent({ id: 'e2', sequence: 2, event_type: 'tool_use', tool_name: 'Read', content: 'Reading' }),
      ]
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession({ event_count: 2 })])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})
      vi.mocked(getSDKSessionEvents).mockResolvedValue(events)

      render(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText(/event timeline/i)).toBeInTheDocument()
        expect(screen.getByText('#1')).toBeInTheDocument()
        expect(screen.getByText('#2')).toBeInTheDocument()
      })
    })
  })
})
