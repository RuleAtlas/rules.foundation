import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// Mock all page components to avoid rendering full trees
vi.mock('./components/LandingPage', () => ({
  default: () => <div data-testid="landing-page">LandingPage</div>,
}))

vi.mock('./pages/LabPage', () => ({
  default: () => <div data-testid="lab-page">LabPage</div>,
}))

vi.mock('./pages/AboutPage', () => ({
  default: () => <div data-testid="about-page">AboutPage</div>,
}))

vi.mock('./pages/PrivacyPage', () => ({
  default: () => <div data-testid="privacy-page">PrivacyPage</div>,
}))

// App uses BrowserRouter internally, but for tests we need MemoryRouter.
// We override BrowserRouter to use MemoryRouter so we can control the initial route.
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  }
})

const renderApp = (route: string) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App', () => {
  it('renders landing page at /', () => {
    renderApp('/')
    expect(screen.getByTestId('landing-page')).toBeInTheDocument()
  })

  it('renders lab page at /lab', () => {
    renderApp('/lab')
    expect(screen.getByTestId('lab-page')).toBeInTheDocument()
  })

  it('renders about page at /about', () => {
    renderApp('/about')
    expect(screen.getByTestId('about-page')).toBeInTheDocument()
  })

  it('renders privacy page at /privacy', () => {
    renderApp('/privacy')
    expect(screen.getByTestId('privacy-page')).toBeInTheDocument()
  })
})
