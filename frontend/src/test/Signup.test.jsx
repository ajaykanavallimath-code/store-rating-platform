import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import Signup from '../pages/Signup';
import { AuthProvider } from '../context/AuthContext';

describe('Signup Component', () => {
  it('renders all required signup fields and password requirements', () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthProvider>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Residential Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByText(/Password Requirements:/i)).toBeInTheDocument();
  });

  it('validates name length requirement (min 20 chars)', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthProvider>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'Too Short' } });

    const submitBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 20 characters/i)).toBeInTheDocument();
    });
  });

  it('validates mismatched passwords', async () => {
    render(
      <AuthProvider>
        <BrowserRouter>
          <Signup />
        </BrowserRouter>
      </AuthProvider>
    );

    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'Jonathan David Doe Consumer' } });

    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

    const addressInput = screen.getByLabelText(/Residential Address/i);
    fireEvent.change(addressInput, { target: { value: '123 Main Street, Suite 400' } });

    const passwordInput = screen.getByLabelText(/^Password/i);
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });

    const confirmPasswordInput = screen.getByLabelText(/Confirm Password/i);
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });

    const submitBtn = screen.getByRole('button', { name: /Register Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
