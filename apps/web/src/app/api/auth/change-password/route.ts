import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getCurrentUser } from '../../../../lib/auth/session';
import { prisma } from '../../../../lib/prisma';
import { createSuccessResponse, handleApiError, ValidationError } from '../../../../lib/api/errors';
import { apiMiddleware, withMethods } from '../../../../lib/api/middleware';
import { Logger } from '@crops-ai/shared';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

// POST /api/auth/change-password
export const POST = apiMiddleware.basic(
  withMethods(['POST'], async (request: NextRequest) => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        throw new ValidationError('Authentication required');
      }

      const body = await request.json();
      const validation = changePasswordSchema.safeParse(body);
      
      if (!validation.success) {
        throw new ValidationError(validation.error.errors[0].message);
      }

      const { currentPassword, newPassword } = validation.data;

      // Get user with password from database
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, passwordHash: true }
      });

      if (!dbUser || !dbUser.passwordHash) {
        throw new ValidationError('User not found or no password set');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isValidPassword) {
        throw new ValidationError('Current password is incorrect');
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password in database
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: hashedNewPassword }
      });

      return createSuccessResponse({
        message: 'Password changed successfully'
      });

    } catch (error) {
      Logger.error('Change password error', error);
      return handleApiError(error);
    }
  })
);