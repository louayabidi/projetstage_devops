import { render, screen, waitFor } from '@testing-library/react'; 
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App routing', () => {
  it('renders home page at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/Discover Amazing/)).toBeInTheDocument();
  });

  it('renders 404 page on unknown route', async () => { 
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    );
    // Attendez et vérifiez (pour la redirection/rendu)
    await waitFor(() => {
      expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });
  });
});