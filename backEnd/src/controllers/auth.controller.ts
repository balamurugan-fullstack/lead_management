import { Request, Response } from 'express';
import { z } from 'zod';
import { loginUser, registerUser, requestPasswordReset, resetPassword } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    }

    const status = error instanceof Error && 'status' in error ? (error as Error & { status?: number }).status : 500;
    res.status(status ?? 500).json({ message: error instanceof Error ? error.message : 'Failed to register user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    }

    const status = error instanceof Error && 'status' in error ? (error as Error & { status?: number }).status : 500;
    res.status(status ?? 500).json({ message: error instanceof Error ? error.message : 'Failed to login' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await requestPasswordReset(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    }

    const status = error instanceof Error && 'status' in error ? (error as Error & { status?: number }).status : 500;
    res.status(status ?? 500).json({ message: error instanceof Error ? error.message : 'Failed to process password reset' });
  }
};

export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const result = await resetPassword(req.body);
    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: error.flatten() });
    }

    const status = error instanceof Error && 'status' in error ? (error as Error & { status?: number }).status : 500;
    res.status(status ?? 500).json({ message: error instanceof Error ? error.message : 'Failed to reset password' });
  }
};
