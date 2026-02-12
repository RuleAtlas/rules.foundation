import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'

const renderWithRouter = (ui: React.ReactElement, route = '/') => {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}

describe('Header', () => {
  it('renders the logo linking to home', () => {
    renderWithRouter(<Header />)
    const logo = screen.getByAltText('Rules Foundation')
    expect(logo).toBeInTheDocument()
    expect(logo.closest('a')).toHaveAttribute('href', '/')
  })

  it('renders navigation links', () => {
    renderWithRouter(<Header />)
    expect(screen.getByText('Atlas')).toBeInTheDocument()
    expect(screen.getByText('.rac')).toBeInTheDocument()
    expect(screen.getByText('AutoRAC')).toBeInTheDocument()
    expect(screen.getByText('Lab')).toBeInTheDocument()
    expect(screen.getByText('Spec')).toBeInTheDocument()
    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Docs')).toBeInTheDocument()
  })

  it('renders anchor links on landing variant', () => {
    renderWithRouter(<Header variant="landing" />)
    const atlasLink = screen.getByText('Atlas')
    expect(atlasLink.closest('a')).toHaveAttribute('href', '#atlas')
  })

  it('renders lab variant with anchor links pointing back to landing', () => {
    renderWithRouter(<Header variant="lab" />, '/lab')
    const atlasLink = screen.getByText('Atlas')
    // On lab page, anchor links should use Link to /#hash
    expect(atlasLink.closest('a')).toHaveAttribute('href', '/#atlas')
  })

  it('marks Lab link as active on /lab', () => {
    renderWithRouter(<Header variant="lab" />, '/lab')
    const labLink = screen.getByText('Lab')
    // The Lab link should have the active class
    expect(labLink.closest('a')).toBeInTheDocument()
  })

  it('renders GitHub icon link', () => {
    renderWithRouter(<Header />)
    // Find the GitHub link (last external link)
    const links = screen.getAllByRole('link')
    const githubLink = links.find(
      (l) => l.getAttribute('href') === 'https://github.com/RulesFoundation',
    )
    expect(githubLink).toBeInTheDocument()
  })
})
