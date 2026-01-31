import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from './LandingPage'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('LandingPage', () => {
  it('renders the hero section with mission statement', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/encoding the world's rules/i)
  })

  it('renders the RAC DSL section', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText(/what is rac/i)).toBeInTheDocument()
    expect(screen.getByText(/rules as code/i)).toBeInTheDocument()
  })

  it('renders the .rac format section with code examples', () => {
    renderWithRouter(<LandingPage />)
    // Use getAllBy since "file format" appears multiple times
    expect(screen.getAllByText(/file format/i).length).toBeGreaterThan(0)
    // Check for format comparison content
    expect(screen.getByText(/format comparison/i)).toBeInTheDocument()
  })

  it('renders the AutoRAC section', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getAllByText(/autorac/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/ai encoding/i)).toBeInTheDocument()
    // Check for 3-tier validation
    expect(screen.getByText(/3-tier validation pipeline/i)).toBeInTheDocument()
  })

  it('renders the RAC specification section', () => {
    renderWithRouter(<LandingPage />)
    // Multiple matches for "RAC_SPEC.md", use getAllBy
    expect(screen.getAllByText(/RAC_SPEC\.md/i).length).toBeGreaterThan(0)
  })

  it('renders the ground truth for AI section', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getAllByText(/ground truth for ai/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/verifiable/i).length).toBeGreaterThan(0)
  })

  it('renders experiment lab section', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getAllByText(/experiment lab/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/encoding runs/i)).toBeInTheDocument()
    expect(screen.getAllByText(/agent transcripts/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/sdk sessions/i)).toBeInTheDocument()
    // Check for CTA link to lab
    expect(screen.getByText(/open experiment lab/i)).toBeInTheDocument()
  })


  it('renders get involved CTA', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByRole('heading', { name: /get involved/i })).toBeInTheDocument()
  })
})
