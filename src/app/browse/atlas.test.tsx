import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => '/browse',
}))

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock supabase
vi.mock('@/lib/supabase', () => {
  const mockFrom = vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      order: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
          is: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
              }),
            }),
          }),
        }),
        range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        is: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            order: vi.fn().mockReturnValue({
              range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
            }),
          }),
        }),
      }),
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
        }),
      }),
      is: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({ data: [], error: null, count: 0 }),
          }),
        }),
      }),
    }),
  })

  return {
    supabaseArch: { from: mockFrom },
    supabase: { from: mockFrom },
  }
})

import AtlasPage from './page'

describe('AtlasPage', () => {
  it('renders the Atlas page with browser', async () => {
    render(<AtlasPage />)
    expect(screen.getByText('Atlas')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search statutes...')).toBeInTheDocument()
  })

  it('renders jurisdiction filter buttons', () => {
    render(<AtlasPage />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'US' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'UK' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Canada' })).toBeInTheDocument()
  })
})
