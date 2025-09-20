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

    // Check that the main heading is displayed
    expect(
      screen.getByRole('heading', { name: /Embark on Your Sea Adventure/i })
    ).toBeInTheDocument();

    // Optional: also check that the paragraph is rendered
    expect(
      screen.getByText(/Discover breathtaking boat rides/i)
    ).toBeInTheDocument();
  });

  it('renders 404 page on unknown route', async () => { 
    render(
      <MemoryRouter initialEntries={['/unknown']}>
        <App />
      </MemoryRouter>
    );

   
    await waitFor(() => {
      expect(screen.getByText(/Page not found/i)).toBeInTheDocument();
    });
  });
});
