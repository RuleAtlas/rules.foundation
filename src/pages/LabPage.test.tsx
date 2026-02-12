import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LabPage from './LabPage'

// Mock all Supabase calls
vi.mock('../lib/supabase', () => ({
  getEncodingRuns: vi.fn().mockResolvedValue([]),
  getAgentTranscripts: vi.fn().mockResolvedValue([]),
  getTranscriptsBySession: vi.fn().mockResolvedValue([]),
  getSDKSessions: vi.fn().mockResolvedValue([]),
  getSDKSessionEvents: vi.fn().mockResolvedValue([]),
}))

import type { EncodingRun } from '../lib/supabase'
import {
  getEncodingRuns,
  getAgentTranscripts,
  getSDKSessions,
  getTranscriptsBySession,
  getSDKSessionEvents,
} from '../lib/supabase'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('LabPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading and mock data fallback', () => {
    it('shows loading state initially', () => {
      // Make the promise hang
      vi.mocked(getEncodingRuns).mockReturnValue(new Promise(() => {}))
      vi.mocked(getAgentTranscripts).mockReturnValue(new Promise(() => {}))
      vi.mocked(getSDKSessions).mockReturnValue(new Promise(() => {}))

      renderWithRouter(<LabPage />)
      expect(screen.getByText(/loading data from supabase/i)).toBeInTheDocument()
    })

    it('falls back to mock data when no runs returned', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText(/MOCK DATA - NOT REAL/i)).toBeInTheDocument()
      })
    })

    it('falls back to mock data on fetch error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(getEncodingRuns).mockRejectedValue(new Error('network error'))
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText(/MOCK DATA - NOT REAL/i)).toBeInTheDocument()
        expect(screen.getByText(/Database error/i)).toBeInTheDocument()
      })
      consoleSpy.mockRestore()
    })

    it('shows live data banner when real data exists with untrusted sources', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([
        {
          id: '1',
          timestamp: '2025-01-01T00:00:00',
          citation: '26 USC 1',
          iterations: [{ attempt: 1, success: true, duration_ms: 1000, errors: [] }],
          scores: { rac: 8, formula: 8, parameter: 8, integration: 8 },
          has_issues: false,
          note: null,
          total_duration_ms: 1000,
          agent_type: null,
          agent_model: null,
          data_source: 'mock',
          session_id: null,
        },
      ])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText(/DATA SOURCE WARNING/i)).toBeInTheDocument()
      })
    })

    it('shows success banner when all data is from reviewer agents', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([
        {
          id: '1',
          timestamp: '2025-01-01T00:00:00',
          citation: '26 USC 1',
          iterations: [{ attempt: 1, success: true, duration_ms: 1000, errors: [] }],
          scores: { rac: 8, formula: 8, parameter: 8, integration: 8 },
          has_issues: false,
          note: null,
          total_duration_ms: 1000,
          agent_type: null,
          agent_model: null,
          data_source: 'reviewer_agent',
          session_id: null,
        },
      ])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText(/live data from supabase/i)).toBeInTheDocument()
      })
    })
  })

  describe('header stats', () => {
    it('renders page header with stats', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('Encoding lab')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'AutoRAC' })).toBeInTheDocument()
        expect(screen.getByText('Runs:')).toBeInTheDocument()
        expect(screen.getByText('Success:')).toBeInTheDocument()
        expect(screen.getByText('Avg Score:')).toBeInTheDocument()
      })
    })
  })

  describe('encoding runs tab', () => {
    it('renders encoding runs table with mock data', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        // Should show mock data (26 USC 137, 26 USC 23, etc.)
        expect(screen.getByText('26 USC 137')).toBeInTheDocument()
        expect(screen.getByText('26 USC 23')).toBeInTheDocument()
      })

      // Switch to another tab and back to exercise the "Encoding runs" onClick
      fireEvent.click(screen.getByRole('button', { name: /known issues/i }))
      fireEvent.click(screen.getByRole('button', { name: /encoding runs/i }))

      await waitFor(() => {
        expect(screen.getByText('26 USC 137')).toBeInTheDocument()
      })
    })

    it('expands and collapses run detail panel when clicking a row', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 137')).toBeInTheDocument()
      })

      // Click on a run
      fireEvent.click(screen.getByText('26 USC 137'))

      await waitFor(() => {
        // Detail panel should show scores section
        expect(screen.getByText('Scores')).toBeInTheDocument()
        expect(screen.getByText('Close \u2715')).toBeInTheDocument()
      })

      // Click close button
      fireEvent.click(screen.getByText('Close \u2715'))

      await waitFor(() => {
        expect(screen.queryByText('Scores')).not.toBeInTheDocument()
      })
    })

    it('toggles run selection on double click same row', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 23')).toBeInTheDocument()
      })

      // Click to expand
      fireEvent.click(screen.getByText('26 USC 23'))
      await waitFor(() => {
        expect(screen.getByText('Scores')).toBeInTheDocument()
      })

      // Click same run to collapse — text now appears twice (table cell + detail header)
      fireEvent.click(screen.getAllByText('26 USC 23')[0])
      await waitFor(() => {
        expect(screen.queryByText('Scores')).not.toBeInTheDocument()
      })
    })

    it('shows run with issues and note', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        // 26 USC 1 has hasIssues: true and a note
        expect(screen.getByText('26 USC 1')).toBeInTheDocument()
        // Should show "structural" tag for the note
        expect(screen.getByText('structural')).toBeInTheDocument()
      })
    })

    it('loads transcripts for a run with sessionId', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([
        {
          id: '1',
          timestamp: '2025-01-01T00:00:00',
          citation: '26 USC 999',
          iterations: [{ attempt: 1, success: true, duration_ms: 1000, errors: [] }],
          scores: { rac: 9, formula: 9, parameter: 9, integration: 9 },
          has_issues: false,
          note: null,
          total_duration_ms: 1000,
          agent_type: null,
          agent_model: null,
          data_source: 'reviewer_agent',
          session_id: 'sess-123',
        },
      ])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])
      vi.mocked(getTranscriptsBySession).mockResolvedValue([
        {
          id: 1,
          session_id: 'sess-123',
          agent_id: null,
          tool_use_id: 'tu-1',
          subagent_type: 'encoder',
          prompt: null,
          description: 'Encoding 26 USC 999',
          response_summary: null,
          transcript: null,
          orchestrator_thinking: null,
          message_count: 10,
          created_at: '2025-01-01T00:00:00',
          uploaded_at: null,
        },
        {
          id: 2,
          session_id: 'sess-123',
          agent_id: null,
          tool_use_id: 'tu-2',
          subagent_type: 'reviewer',
          prompt: null,
          description: null,
          response_summary: null,
          transcript: null,
          orchestrator_thinking: null,
          message_count: 5,
          created_at: '2025-01-01T00:01:00',
          uploaded_at: null,
        },
      ])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 999')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('26 USC 999'))

      await waitFor(() => {
        expect(getTranscriptsBySession).toHaveBeenCalledWith('sess-123')
        expect(screen.getByText('Encoding 26 USC 999')).toBeInTheDocument()
        expect(screen.getByText('10 msgs')).toBeInTheDocument()
      })
    })

    it('shows "no session ID" when run has no sessionId', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([
        {
          id: '1',
          timestamp: '2025-01-01T00:00:00',
          citation: '26 USC 998',
          iterations: [{ attempt: 1, success: true, duration_ms: 1000, errors: [] }],
          scores: { rac: 9, formula: 9, parameter: 9, integration: 9 },
          has_issues: false,
          note: 'Some note',
          total_duration_ms: 1000,
          agent_type: null,
          agent_model: null,
          data_source: 'reviewer_agent',
          session_id: null,
        },
      ])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 998')).toBeInTheDocument()
      })

      fireEvent.click(screen.getByText('26 USC 998'))

      await waitFor(() => {
        expect(screen.getByText(/no session id/i)).toBeInTheDocument()
      })
    })

    it('shows errors when iterations have errors and expands detail with low scores', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([
        {
          id: '1',
          timestamp: '2025-01-01T00:00:00',
          citation: '26 USC 997',
          iterations: [
            {
              attempt: 1,
              success: false,
              duration_ms: 5000,
              errors: [{ type: 'syntax', message: 'bad syntax' }],
            },
          ],
          scores: { rac: 5, formula: 5, parameter: 5, integration: 5 },
          has_issues: false,
          note: null,
          total_duration_ms: 5000,
          agent_type: null,
          agent_model: null,
          data_source: 'reviewer_agent',
          session_id: null,
        },
      ])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('syntax')).toBeInTheDocument()
      })

      // Expand detail panel to trigger getScoreColor for low scores
      fireEvent.click(screen.getByText('26 USC 997'))
      await waitFor(() => {
        expect(screen.getByText('Scores')).toBeInTheDocument()
        // Score 5.0 appears in both table cells (4) and detail panel (4) = 8 total
        expect(screen.getAllByText('5.0').length).toBe(8)
      })
    })

    it('handles iterations with undefined errors array', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([
        {
          id: '2',
          timestamp: '2025-01-01T00:00:00',
          citation: '26 USC 996',
          iterations: [
            // errors array is explicitly undefined (simulating missing field from API)
            { attempt: 1, success: true, duration_ms: 1000, errors: undefined as unknown as { type: string; message: string }[] },
          ],
          scores: { rac: 8, formula: 8, parameter: 8, integration: 8 },
          has_issues: null,
          note: null,
          total_duration_ms: 1000,
          agent_type: null,
          agent_model: null,
          data_source: 'reviewer_agent',
          session_id: null,
        },
      ])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 996')).toBeInTheDocument()
      })
    })

    it('handles runs with null/missing fields via transformToEncodingRunUI', async () => {
      // Supply data with null iterations, scores, and data_source to trigger fallback branches
      vi.mocked(getEncodingRuns).mockResolvedValue([
        {
          id: '3',
          timestamp: '2025-01-01T00:00:00',
          citation: '26 USC 995',
          iterations: null as unknown as EncodingRun['iterations'],
          scores: null as unknown as EncodingRun['scores'],
          has_issues: null,
          note: null,
          total_duration_ms: null,
          agent_type: null,
          agent_model: null,
          data_source: null as unknown as EncodingRun['data_source'],
          session_id: null,
        },
      ])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText('26 USC 995')).toBeInTheDocument()
      })
    })
  })

  describe('transcripts tab', () => {
    it('shows empty state when no transcripts', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.getByText(/MOCK DATA/i)).toBeInTheDocument()
      })

      // Click transcripts tab
      fireEvent.click(screen.getByRole('button', { name: /agent transcripts/i }))

      expect(screen.getByText(/no agent transcripts yet/i)).toBeInTheDocument()
    })

    it('renders transcript list with expandable cards and timestamps toggle', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([
        {
          id: 1,
          session_id: 'sess-1',
          agent_id: null,
          tool_use_id: 'tu-1',
          subagent_type: 'encoder',
          prompt: null,
          description: 'Encode section A',
          response_summary: null,
          transcript: null,
          orchestrator_thinking: 'Decided to encode subsection A first',
          message_count: 5,
          created_at: '2025-01-01T00:00:00',
          uploaded_at: null,
        },
      ])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      // Click transcripts tab
      fireEvent.click(screen.getByRole('button', { name: /agent transcripts/i }))

      expect(screen.getByText('Encode section A')).toBeInTheDocument()
      expect(screen.getByText('5 messages')).toBeInTheDocument()

      // Expand transcript
      fireEvent.click(screen.getByText('Encode section A'))

      expect(screen.getByText('ORCHESTRATOR THINKING')).toBeInTheDocument()
      expect(screen.getByText('Decided to encode subsection A first')).toBeInTheDocument()

      // Toggle show timestamps checkbox
      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
      fireEvent.click(checkbox)
      expect(checkbox).toBeChecked()

      // Collapse
      fireEvent.click(screen.getByText('Encode section A'))
    })

    it('renders transcript without orchestrator thinking', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([
        {
          id: 2,
          session_id: 'sess-2',
          agent_id: null,
          tool_use_id: 'tu-2',
          subagent_type: 'reviewer',
          prompt: null,
          description: 'Review section B',
          response_summary: null,
          transcript: null,
          orchestrator_thinking: null,
          message_count: 3,
          created_at: '2025-01-02T00:00:00',
          uploaded_at: null,
        },
      ])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /agent transcripts/i }))

      // Expand
      fireEvent.click(screen.getByText('Review section B'))

      // No orchestrator thinking should be shown
      expect(screen.queryByText('ORCHESTRATOR THINKING')).not.toBeInTheDocument()
    })

    it('shows transcript badge count and handles null description', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([
        {
          id: 1,
          session_id: 's',
          agent_id: null,
          tool_use_id: 't',
          subagent_type: 'enc',
          prompt: null,
          description: null,
          response_summary: null,
          transcript: null,
          orchestrator_thinking: null,
          message_count: 1,
          created_at: '2025-01-01',
          uploaded_at: null,
        },
      ])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        // The tab should show a badge with the count
        const tabButton = screen.getByRole('button', { name: /agent transcripts/i })
        expect(tabButton).toBeInTheDocument()
      })

      // Switch to transcripts tab to render the transcript with null description
      fireEvent.click(screen.getByRole('button', { name: /agent transcripts/i }))

      // Should show 'No description' fallback
      expect(screen.getByText('No description')).toBeInTheDocument()
    })
  })

  describe('SDK sessions tab', () => {
    it('shows empty state when no sessions', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /sdk sessions/i }))

      expect(screen.getByText(/no missions recorded yet/i)).toBeInTheDocument()
    })

    it('renders SDK session cards', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([
        {
          id: 'sdk-1',
          started_at: '2025-01-01T10:00:00',
          ended_at: '2025-01-01T10:30:00',
          model: 'claude-3',
          cwd: '/tmp',
          event_count: 100,
          input_tokens: 5000,
          output_tokens: 3000,
          cache_read_tokens: 1000,
          estimated_cost_usd: 1.5,
        },
      ])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /sdk sessions/i }))

      expect(screen.getByText('sdk-1')).toBeInTheDocument()
      expect(screen.getByText('$1.50')).toBeInTheDocument()
      expect(screen.getByText('8,000')).toBeInTheDocument() // total tokens
    })

    it('handles session click to select and deselect', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([
        {
          id: 'sdk-2',
          started_at: '2025-01-01T10:00:00',
          ended_at: null,
          model: null,
          cwd: null,
          event_count: 50,
          input_tokens: 2000,
          output_tokens: 1000,
          cache_read_tokens: 0,
          estimated_cost_usd: 0.75,
        },
      ])
      vi.mocked(getSDKSessionEvents).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /sdk sessions/i }))

      // Click session to select
      fireEvent.click(screen.getByText('sdk-2'))
      await waitFor(() => {
        expect(getSDKSessionEvents).toHaveBeenCalledWith('sdk-2', 500)
      })

      // Click again to deselect
      fireEvent.click(screen.getByText('sdk-2'))
    })
  })

  describe('plugin content tab', () => {
    it('renders plugin content with agents, skills, and commands', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /plugin content/i }))

      // RF plugin
      expect(screen.getByText(/rules-foundation v0.3.0/i)).toBeInTheDocument()
      expect(screen.getByText('Encoding Orchestrator')).toBeInTheDocument()
      expect(screen.getByText('rac-encoding')).toBeInTheDocument()
      expect(screen.getByText('/encode')).toBeInTheDocument()

      // Cosilico plugin
      expect(screen.getByText(/cosilico v0.4.0/i)).toBeInTheDocument()
      expect(screen.getByText('microplex')).toBeInTheDocument()
      expect(screen.getByText('session-start')).toBeInTheDocument()
    })
  })

  describe('known issues tab', () => {
    it('renders known issues', async () => {
      vi.mocked(getEncodingRuns).mockResolvedValue([])
      vi.mocked(getAgentTranscripts).mockResolvedValue([])
      vi.mocked(getSDKSessions).mockResolvedValue([])

      renderWithRouter(<LabPage />)

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /known issues/i }))

      expect(screen.getByText('26 USC 1 encoding quality')).toBeInTheDocument()
      expect(screen.getByText('Reviewer agent calibration')).toBeInTheDocument()
    })
  })
})
