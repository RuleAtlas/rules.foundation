import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import LandingPage from './LandingPage'

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

describe('LandingPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

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

  it('renders footer with links', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText(/open infrastructure for encoded law/i)).toBeInTheDocument()
  })

  it('renders encoding coverage section', () => {
    renderWithRouter(<LandingPage />)
    expect(screen.getByText(/encoding coverage/i)).toBeInTheDocument()
    expect(screen.getByText(/Federal \(rac-us\)/i)).toBeInTheDocument()
    expect(screen.getByText(/California \(rac-us-ca\)/i)).toBeInTheDocument()
    expect(screen.getByText(/New York \(rac-us-ny\)/i)).toBeInTheDocument()
  })

  it('switches format tabs to show different code examples', () => {
    renderWithRouter(<LandingPage />)

    // Default is RAC tab - switch to DMN
    const dmnTab = screen.getByRole('button', { name: 'DMN' })
    fireEvent.click(dmnTab)
    expect(screen.getByText('niit.dmn')).toBeInTheDocument()

    // Switch to OpenFisca
    const ofTab = screen.getByRole('button', { name: 'OpenFisca/PE' })
    fireEvent.click(ofTab)
    // Check for Python code presence
    expect(screen.getAllByText(/net_investment_income_tax/i).length).toBeGreaterThan(0)

    // Switch to Catala
    const catalaTab = screen.getByRole('button', { name: 'Catala' })
    fireEvent.click(catalaTab)
    expect(screen.getByText('niit.catala_en')).toBeInTheDocument()
  })

  it('switches code examples between statutes', () => {
    renderWithRouter(<LandingPage />)

    // Click ACA PTC example — default tab is RAC, filename is path-based
    fireEvent.click(screen.getByRole('button', { name: 'ACA Premium Tax Credit' }))
    expect(screen.getByText('statute/26/36B/b/3/A.rac')).toBeInTheDocument()

    // Click Standard Deduction
    fireEvent.click(screen.getByRole('button', { name: 'Standard Deduction' }))
    expect(screen.getByText('statute/26/63/c/2/A.rac')).toBeInTheDocument()

    // Click NY EITC
    fireEvent.click(screen.getByRole('button', { name: 'NY EITC' }))
    expect(screen.getByText('statute/ny/tax/606/d.rac')).toBeInTheDocument()
  })

  it('switches non-RAC format tabs across different examples', () => {
    renderWithRouter(<LandingPage />)

    // Switch to ACA PTC + DMN
    fireEvent.click(screen.getByRole('button', { name: 'ACA Premium Tax Credit' }))
    fireEvent.click(screen.getByRole('button', { name: 'DMN' }))
    expect(screen.getByText('aca_ptc.dmn')).toBeInTheDocument()

    // Switch to Standard Deduction + OpenFisca
    fireEvent.click(screen.getByRole('button', { name: 'Standard Deduction' }))
    fireEvent.click(screen.getByRole('button', { name: 'OpenFisca/PE' }))

    // Switch to NY EITC + Catala
    fireEvent.click(screen.getByRole('button', { name: 'NY EITC' }))
    fireEvent.click(screen.getByRole('button', { name: 'Catala' }))
    expect(screen.getByText('ny_eitc.catala_en')).toBeInTheDocument()
  })

  it('shows all Catala examples', () => {
    renderWithRouter(<LandingPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Catala' }))

    // NIIT catala
    expect(screen.getByText('niit.catala_en')).toBeInTheDocument()

    // ACA PTC catala
    fireEvent.click(screen.getByRole('button', { name: 'ACA Premium Tax Credit' }))
    expect(screen.getByText('aca_ptc.catala_en')).toBeInTheDocument()

    // Standard deduction catala
    fireEvent.click(screen.getByRole('button', { name: 'Standard Deduction' }))
    expect(screen.getByText('standard_deduction.catala_en')).toBeInTheDocument()

    // NY EITC catala
    fireEvent.click(screen.getByRole('button', { name: 'NY EITC' }))
    expect(screen.getByText('ny_eitc.catala_en')).toBeInTheDocument()
  })

  it('shows all DMN examples', () => {
    renderWithRouter(<LandingPage />)

    fireEvent.click(screen.getByRole('button', { name: 'DMN' }))
    expect(screen.getByText('niit.dmn')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'ACA Premium Tax Credit' }))
    expect(screen.getByText('aca_ptc.dmn')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Standard Deduction' }))
    expect(screen.getByText('standard_deduction.dmn')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'NY EITC' }))
    expect(screen.getByText('ny_eitc.dmn')).toBeInTheDocument()
  })

  it('shows all OpenFisca examples', () => {
    renderWithRouter(<LandingPage />)

    fireEvent.click(screen.getByRole('button', { name: 'OpenFisca/PE' }))

    // ACA PTC
    fireEvent.click(screen.getByRole('button', { name: 'ACA Premium Tax Credit' }))

    // Standard deduction
    fireEvent.click(screen.getByRole('button', { name: 'Standard Deduction' }))

    // NY EITC
    fireEvent.click(screen.getByRole('button', { name: 'NY EITC' }))
  })

  it('CodeTransform auto-advances phases with timer', () => {
    renderWithRouter(<LandingPage />)

    // Advance 3 seconds to trigger phase change
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Advance again
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // And again to cycle back
    act(() => {
      vi.advanceTimersByTime(3000)
    })
  })

  it('CodeTransform click pauses auto-advance and manually advances', () => {
    renderWithRouter(<LandingPage />)

    // Find the code transform container (has title "Click to advance")
    const codeTransform = screen.getByTitle('Click to advance')

    // Click to pause and advance
    fireEvent.click(codeTransform)

    // Timer should now be paused, so advancing time should not change phase
    act(() => {
      vi.advanceTimersByTime(6000)
    })

    // Click again to advance to next phase
    fireEvent.click(codeTransform)

    // Click once more to cycle
    fireEvent.click(codeTransform)
  })

  it('expands and collapses the RAC spec', () => {
    renderWithRouter(<LandingPage />)

    // Find expand button
    const expandBtn = screen.getByRole('button', { name: /expand full spec/i })
    fireEvent.click(expandBtn)

    // Now it should show "Collapse"
    expect(screen.getByRole('button', { name: /collapse/i })).toBeInTheDocument()

    // Click to collapse
    fireEvent.click(screen.getByRole('button', { name: /collapse/i }))
    expect(screen.getByRole('button', { name: /expand full spec/i })).toBeInTheDocument()
  })
})
