import { describe, it, expect, vi, beforeEach } from 'vitest'

// Use vi.hoisted to create mock functions that are available during vi.mock hoisting
const { mockFrom, mockRpc } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockRpc: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: mockFrom,
    rpc: mockRpc,
  }),
}))

// Now import the functions (they'll use the mocked supabase client)
import {
  getEncodingRuns,
  getAgentTranscripts,
  getTranscriptsBySession,
  getSDKSessions,
  getSDKSessionEvents,
} from './supabase'

describe('supabase lib', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getEncodingRuns', () => {
    it('returns encoding runs from rpc', async () => {
      const mockData = [{ id: '1', citation: '26 USC 1' }]
      mockRpc.mockResolvedValue({ data: mockData, error: null })

      const result = await getEncodingRuns(10, 0)
      expect(result).toEqual(mockData)
      expect(mockRpc).toHaveBeenCalledWith('get_encoding_runs', {
        limit_count: 10,
        offset_count: 0,
      })
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      mockRpc.mockResolvedValue({ data: null, error: { message: 'test error' } })

      const result = await getEncodingRuns()
      expect(result).toEqual([])
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('returns empty array when data is null', async () => {
      mockRpc.mockResolvedValue({ data: null, error: null })
      const result = await getEncodingRuns()
      expect(result).toEqual([])
    })

    it('uses default parameters', async () => {
      mockRpc.mockResolvedValue({ data: [], error: null })
      await getEncodingRuns()
      expect(mockRpc).toHaveBeenCalledWith('get_encoding_runs', {
        limit_count: 100,
        offset_count: 0,
      })
    })
  })

  describe('getAgentTranscripts', () => {
    it('returns transcripts', async () => {
      const mockData = [{ id: 1, subagent_type: 'encoder' }]
      const rangeFn = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const orderFn = vi.fn().mockReturnValue({ range: rangeFn })
      const selectFn = vi.fn().mockReturnValue({ order: orderFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getAgentTranscripts(50, 10)
      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('agent_transcripts')
      expect(selectFn).toHaveBeenCalledWith('*')
      expect(orderFn).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(rangeFn).toHaveBeenCalledWith(10, 59)
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const rangeFn = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
      const orderFn = vi.fn().mockReturnValue({ range: rangeFn })
      const selectFn = vi.fn().mockReturnValue({ order: orderFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getAgentTranscripts()
      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })

    it('returns empty when data is null without error', async () => {
      const rangeFn = vi.fn().mockResolvedValue({ data: null, error: null })
      const orderFn = vi.fn().mockReturnValue({ range: rangeFn })
      const selectFn = vi.fn().mockReturnValue({ order: orderFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getAgentTranscripts()
      expect(result).toEqual([])
    })
  })

  describe('getTranscriptsBySession', () => {
    it('returns transcripts for a session', async () => {
      const mockData = [{ id: 1, session_id: 'sess-1' }]
      const orderFn = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const eqFn = vi.fn().mockReturnValue({ order: orderFn })
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getTranscriptsBySession('sess-1')
      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('agent_transcripts')
      expect(eqFn).toHaveBeenCalledWith('session_id', 'sess-1')
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const orderFn = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
      const eqFn = vi.fn().mockReturnValue({ order: orderFn })
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getTranscriptsBySession('sess-1')
      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })

    it('returns empty when data is null without error', async () => {
      const orderFn = vi.fn().mockResolvedValue({ data: null, error: null })
      const eqFn = vi.fn().mockReturnValue({ order: orderFn })
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getTranscriptsBySession('sess-1')
      expect(result).toEqual([])
    })
  })

  describe('getSDKSessions', () => {
    it('returns SDK sessions', async () => {
      const mockData = [{ id: 'sdk-1' }]
      const limitFn = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const selectFn = vi.fn().mockReturnValue({ order: orderFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getSDKSessions(10)
      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('sdk_sessions')
      expect(limitFn).toHaveBeenCalledWith(10)
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const limitFn = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const selectFn = vi.fn().mockReturnValue({ order: orderFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getSDKSessions()
      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })

    it('uses default limit', async () => {
      const limitFn = vi.fn().mockResolvedValue({ data: [], error: null })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const selectFn = vi.fn().mockReturnValue({ order: orderFn })
      mockFrom.mockReturnValue({ select: selectFn })

      await getSDKSessions()
      expect(limitFn).toHaveBeenCalledWith(50)
    })

    it('returns empty when data is null without error', async () => {
      const limitFn = vi.fn().mockResolvedValue({ data: null, error: null })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const selectFn = vi.fn().mockReturnValue({ order: orderFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getSDKSessions()
      expect(result).toEqual([])
    })
  })

  describe('getSDKSessionEvents', () => {
    it('returns events for a session', async () => {
      const mockData = [{ id: 'evt-1' }]
      const limitFn = vi.fn().mockResolvedValue({ data: mockData, error: null })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const eqFn = vi.fn().mockReturnValue({ order: orderFn })
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getSDKSessionEvents('sdk-1', 50)
      expect(result).toEqual(mockData)
      expect(mockFrom).toHaveBeenCalledWith('sdk_session_events')
      expect(eqFn).toHaveBeenCalledWith('session_id', 'sdk-1')
    })

    it('returns empty array on error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const limitFn = vi.fn().mockResolvedValue({ data: null, error: { message: 'err' } })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const eqFn = vi.fn().mockReturnValue({ order: orderFn })
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getSDKSessionEvents('sdk-1')
      expect(result).toEqual([])
      consoleSpy.mockRestore()
    })

    it('uses default limit', async () => {
      const limitFn = vi.fn().mockResolvedValue({ data: [], error: null })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const eqFn = vi.fn().mockReturnValue({ order: orderFn })
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
      mockFrom.mockReturnValue({ select: selectFn })

      await getSDKSessionEvents('sdk-1')
      expect(limitFn).toHaveBeenCalledWith(100)
    })

    it('returns empty when data is null without error', async () => {
      const limitFn = vi.fn().mockResolvedValue({ data: null, error: null })
      const orderFn = vi.fn().mockReturnValue({ limit: limitFn })
      const eqFn = vi.fn().mockReturnValue({ order: orderFn })
      const selectFn = vi.fn().mockReturnValue({ eq: eqFn })
      mockFrom.mockReturnValue({ select: selectFn })

      const result = await getSDKSessionEvents('sdk-1')
      expect(result).toEqual([])
    })
  })
})
