import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LabPage from './LabPage'

// Mock all Supabase calls
vi.mock('../lib/supabase', () => ({
  getSDKSessions: vi.fn().mockResolvedValue([]),
  getSDKSessionEvents: vi.fn().mockResolvedValue([]),
  getSDKSessionMeta: vi.fn().mockResolvedValue({}),
}))

import {
  getSDKSessions,
  getSDKSessionEvents,
  getSDKSessionMeta,
} from '../lib/supabase'
import type { SDKSession, SDKSessionEvent } from '../lib/supabase'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

// Helper to create a mock session
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

// Helper to create a mock event
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

      renderWithRouter(<LabPage />)
      expect(screen.getByText(/loading sessions/i)).toBeInTheDocument()
    })

    it('shows empty state when no sessions exist', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

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

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('Encoding lab')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'AutoRAC' })).toBeInTheDocument()
        // Sessions count
        expect(screen.getByText('2')).toBeInTheDocument()
        // Total tokens: 11,000
        expect(screen.getByText('11,000')).toBeInTheDocument()
        // Total cost: $2.25
        expect(screen.getByText('$2.25')).toBeInTheDocument()
      })
    })
  })

  describe('session cards', () => {
    it('renders session card with stats', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession()])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
        // Stats appear in both header and card
        expect(screen.getAllByText('$1.50').length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText('8,000').length).toBeGreaterThanOrEqual(1)
      })
    })

    it('shows session title from meta when available', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession()])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({
        'sdk-1': { title: '26 USC 137', lastEventAt: null },
      })

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 137')).toBeInTheDocument()
      })
    })

    it('selects and deselects session on click', async () => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession()])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})
      vi.mocked(getSDKSessionEvents).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      // Click to select
      fireEvent.click(screen.getByText('sdk-1'))
      await waitFor(() => {
        expect(getSDKSessionEvents).toHaveBeenCalledWith('sdk-1', 2000)
      })

      // Click again to deselect
      fireEvent.click(screen.getByText('sdk-1'))
      // Detail panel should be gone
      expect(screen.queryByText(/agent phases/i)).not.toBeInTheDocument()
    })
  })

  describe('detail panel - phases', () => {
    const phaseEvents: SDKSessionEvent[] = [
      // Phase 1: agent_start -> tool_use -> tool_result -> message -> agent_end
      mockEvent({ id: 'e1', sequence: 1, event_type: 'agent_start', content: 'Encode section A' }),
      mockEvent({ id: 'e2', sequence: 2, event_type: 'tool_use', tool_name: 'Read', content: 'Reading file.rac' }),
      mockEvent({ id: 'e3', sequence: 3, event_type: 'tool_result', tool_name: 'Read', content: 'File contents here...' }),
      mockEvent({ id: 'e4', sequence: 4, event_type: 'message', content: 'Analysis complete' }),
      mockEvent({ id: 'e5', sequence: 5, event_type: 'agent_end', content: null }),
      // Phase 2: agent_start -> tool_use -> agent_end
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
      renderWithRouter(<LabPage />)

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
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('5 events')).toBeInTheDocument() // Phase 1: e1-e5
        expect(screen.getByText('3 events')).toBeInTheDocument() // Phase 2: e6-e8
      })
    })

    it('shows tool usage badges per phase', async () => {
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        // Phase 1 has Read x2 (tool_use + tool_result) - appears in phase badges and tool summary
        expect(screen.getAllByText(/Read/).length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  describe('phase event drilldown', () => {
    const phaseEvents: SDKSessionEvent[] = [
      // Phase 1
      mockEvent({ id: 'e1', sequence: 1, event_type: 'agent_start', content: 'Encode section A', timestamp: '2025-01-01T10:00:05Z' }),
      mockEvent({ id: 'e2', sequence: 2, event_type: 'tool_use', tool_name: 'Read', content: 'Reading file.rac', timestamp: '2025-01-01T10:00:10Z' }),
      mockEvent({ id: 'e3', sequence: 3, event_type: 'tool_result', tool_name: 'Read', content: 'File contents here with more text that is quite long and should be truncated when not expanded in the UI to keep things compact', timestamp: '2025-01-01T10:00:15Z' }),
      mockEvent({ id: 'e4', sequence: 4, event_type: 'message', content: 'Analysis complete', timestamp: '2025-01-01T10:00:20Z' }),
      mockEvent({ id: 'e5', sequence: 5, event_type: 'agent_end', content: null, timestamp: '2025-01-01T10:00:25Z' }),
      // Phase 2
      mockEvent({ id: 'e6', sequence: 6, event_type: 'agent_start', content: 'Review encoding', timestamp: '2025-01-01T10:00:30Z' }),
      mockEvent({ id: 'e7', sequence: 7, event_type: 'tool_use', tool_name: 'Write', content: 'Writing output', timestamp: '2025-01-01T10:00:35Z' }),
      mockEvent({ id: 'e8', sequence: 8, event_type: 'agent_end', content: null, timestamp: '2025-01-01T10:00:40Z' }),
    ]

    beforeEach(() => {
      vi.mocked(getSDKSessions).mockResolvedValue([mockSession({ event_count: 8 })])
      vi.mocked(getSDKSessionMeta).mockResolvedValue({})
      vi.mocked(getSDKSessionEvents).mockResolvedValue(phaseEvents)
    })

    it('expands phase to show events on click', async () => {
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      // Select session
      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      // Count sequence numbers before expanding (they appear in event timeline)
      const beforeCount = screen.getAllByText('#1').length

      // Click phase 1 to expand
      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        // After expanding, sequence numbers appear in BOTH the phase drilldown and event timeline
        expect(screen.getAllByText('#1').length).toBeGreaterThan(beforeCount)
        expect(screen.getAllByText('#2').length).toBeGreaterThan(1)
        expect(screen.getAllByText('#5').length).toBeGreaterThan(1)
      })
    })

    it('collapses expanded phase on second click', async () => {
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      // Expand phase 1
      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        // Events appear twice (phase + timeline)
        expect(screen.getAllByText('#1').length).toBe(2)
      })

      // Collapse phase 1
      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        // Events should appear only once now (just in timeline)
        expect(screen.getAllByText('#1').length).toBe(1)
      })
    })

    it('shows event type badges with correct labels in expanded phase', async () => {
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      // Expand phase 1
      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        // Event type labels appear in both phase drilldown and event timeline
        expect(screen.getAllByText('agent_start').length).toBeGreaterThan(1)
        expect(screen.getAllByText('tool_use:Read').length).toBeGreaterThan(1)
        expect(screen.getAllByText('tool_result:Read').length).toBeGreaterThan(1)
      })
    })

    it('allows expanding event content within a phase', async () => {
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      // Expand phase 1
      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        // Content appears in both phase drilldown and timeline
        expect(screen.getAllByText(/File contents here/).length).toBeGreaterThan(1)
      })

      // Click on the first event #3 (in the phase drilldown) to expand its full content
      const seq3Elements = screen.getAllByText('#3')
      fireEvent.click(seq3Elements[0])

      await waitFor(() => {
        // Full content should now be visible (at least in the expanded event)
        expect(screen.getAllByText(/should be truncated when not expanded/).length).toBeGreaterThanOrEqual(1)
      })
    })

    it('can expand multiple phases independently', async () => {
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
        expect(screen.getByText('Phase 2')).toBeInTheDocument()
      })

      // Expand both phases
      fireEvent.click(screen.getByText('Phase 1'))
      fireEvent.click(screen.getByText('Phase 2'))

      await waitFor(() => {
        // Phase 1 events appear twice (phase drilldown + timeline)
        expect(screen.getAllByText('#1').length).toBe(2)
        // Phase 2 events appear twice
        expect(screen.getAllByText('#7').length).toBe(2)
      })
    })

    it('shows expand/collapse indicator on phase cards', async () => {
      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('sdk-1')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('sdk-1'))

      await waitFor(() => {
        expect(screen.getByText('Phase 1')).toBeInTheDocument()
      })

      // Before expanding, should show right-pointing indicator
      expect(screen.getAllByText('▶').length).toBeGreaterThanOrEqual(2) // phases + session

      // Expand phase 1
      fireEvent.click(screen.getByText('Phase 1'))

      await waitFor(() => {
        // After expanding, phase 1 should show down-pointing indicator
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

      renderWithRouter(<LabPage />)

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
