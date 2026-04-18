import { render, screen } from '@testing-library/react';
import App from './App';

test('renders banking login hero content', () => {
  render(<App />);
  const heroElement = screen.getByText(/move money with clarity and confidence/i);
  expect(heroElement).toBeInTheDocument();
});
