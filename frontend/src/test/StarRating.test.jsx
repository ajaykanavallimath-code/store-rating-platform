import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StarRating from '../components/StarRating';

describe('StarRating Component', () => {
  it('renders 5 star buttons by default', () => {
    render(<StarRating rating={4} readOnly={false} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('displays the numeric rating when showValue is true', () => {
    render(<StarRating rating={4.5} showValue={true} readOnly={true} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('calls onChange callback when a star is clicked', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={0} onChange={handleChange} readOnly={false} />);

    const starButtons = screen.getAllByRole('button');
    fireEvent.click(starButtons[3]); // 4th star (value 4)

    expect(handleChange).toHaveBeenCalledWith(4);
  });

  it('does not trigger onChange when in readOnly mode', () => {
    const handleChange = vi.fn();
    render(<StarRating rating={3} onChange={handleChange} readOnly={true} />);

    const starButtons = screen.getAllByRole('button');
    expect(starButtons[0]).toBeDisabled();
    fireEvent.click(starButtons[0]);

    expect(handleChange).not.toHaveBeenCalled();
  });
});
