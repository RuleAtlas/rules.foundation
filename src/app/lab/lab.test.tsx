import { describe, it, expect, vi } from 'vitest'

const { mockRedirect } = vi.hoisted(() => ({
  mockRedirect: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

import LabPage from '@/app/lab/page'

describe('LabPage', () => {
  it('redirects to /atlas', () => {
    LabPage()
    expect(mockRedirect).toHaveBeenCalledWith('/atlas')
  })
})
