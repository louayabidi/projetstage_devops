import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

describe('App component', () => {
  it('renders the main heading', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    // Match text across multiple lines / elements
    expect(
      screen.getByText((content, element) =>
        content.includes('Discover Amazing') && content.includes('Boat Experiences')
      )
    ).toBeInTheDocument();
  });
});
