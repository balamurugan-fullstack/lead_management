import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { sendPasswordResetEmail } from '../utils/mailer';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(6),
});

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const createToken = (user: { id: number; email: string }) =>
  jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

export const registerUser = async (input: unknown) => {
  const data = registerSchema.parse(input);
  const existing = await prisma.user.findUnique({ where: { email: data.email } });

  if (existing) {
    const error = new Error('User already exists') as Error & { status?: number };
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash },
  });

  return {
    token: createToken(user),
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const loginUser = async (input: unknown) => {
  const data = loginSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    const error = new Error('Invalid credentials') as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  const valid = await bcrypt.compare(data.password, user.passwordHash);
  if (!valid) {
    const error = new Error('Invalid credentials') as Error & { status?: number };
    error.status = 401;
    throw error;
  }

  return {
    token: createToken(user),
    user: { id: user.id, name: user.name, email: user.email },
  };
};

export const requestPasswordReset = async (input: unknown) => {
  const data = forgotPasswordSchema.parse(input);
  const user = await prisma.user.findUnique({ where: { email: data.email } });

  if (!user) {
    return {
      message: 'If that email exists, a password reset code has been prepared.',
      resetToken: null,
    };
  }

  const resetToken = randomBytes(6).toString('hex').toUpperCase();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await sendPasswordResetEmail(user.email, resetToken);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: hashToken(resetToken),
      passwordResetExpires: expiresAt,
    },
  });

  return {
    message: 'If that email exists, a password reset code has been sent to the email address. If email delivery is not configured, check the server terminal for the reset code.',
  };
};

export const resetPassword = async (input: unknown) => {
  const data = resetPasswordSchema.parse(input);
  const now = new Date();
  const users = await prisma.user.findMany({
    where: {
      passwordResetExpires: {
        gt: now,
      },
    },
    select: {
      id: true,
      passwordResetToken: true,
      passwordResetExpires: true,
    },
  });

  const user = users.find((item) => item.passwordResetToken && item.passwordResetToken === hashToken(data.token));

  if (!user) {
    const error = new Error('Invalid or expired reset code') as Error & { status?: number };
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return { message: 'Password updated successfully. You can sign in now.' };
};
