import bcrypt from 'bcryptjs'
import { prisma } from '@crops-ai/database'
import { UserRole } from '@crops-ai/shared'

export class AuthUtils {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Create a new user with hashed password
   */
  static async createUser(data: {
    email: string
    name: string
    password: string
    role?: UserRole
  }) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      })

      if (existingUser) {
        throw new Error('User already exists with this email')
      }

      const passwordHash = await this.hashPassword(data.password)

      const user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash,
          role: data.role || UserRole.FARM_OWNER
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true
        }
      })

      return user
    } finally {
      // Don't disconnect in serverless - let connection pool handle it
      // await prisma.$disconnect()
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, newPassword: string) {
    const passwordHash = await this.hashPassword(newPassword)

    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    })
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*(),.?":{}|<>'
    const allChars = uppercase + lowercase + numbers + symbols

    let password = ''
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)]
    password += lowercase[Math.floor(Math.random() * lowercase.length)]
    password += numbers[Math.floor(Math.random() * numbers.length)]
    password += symbols[Math.floor(Math.random() * symbols.length)]

    // Fill the rest with random characters
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)]
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('')
  }

  /**
   * Check if user has permission to access a resource
   */
  static async hasPermission(
    userId: string,
    resourceType: 'farm' | 'field' | 'crop',
    resourceId: string,
    permission: 'read' | 'write' | 'delete' = 'read'
  ): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user) return false

    // Admins have all permissions
    if (user.role === UserRole.ADMIN) return true

    // Check resource-specific permissions
    switch (resourceType) {
      case 'farm':
        const farm = await prisma.farm.findUnique({
          where: { id: resourceId },
          include: {
            managers: {
              where: { userId },
              select: { userId: true }
            }
          }
        })

        if (!farm) return false

        // Farm owners have all permissions
        if (farm.ownerId === userId) return true

        // Farm managers have read/write permissions
        if (farm.managers.length > 0 && permission !== 'delete') return true

        return false

      case 'field':
        const field = await prisma.field.findUnique({
          where: { id: resourceId },
          include: {
            farm: {
              include: {
                managers: {
                  where: { userId },
                  select: { userId: true }
                }
              }
            }
          }
        })

        if (!field) return false

        // Farm owners have all permissions
        if (field.farm.ownerId === userId) return true

        // Farm managers have read/write permissions
        if (field.farm.managers.length > 0 && permission !== 'delete') return true

        return false

      case 'crop':
        const crop = await prisma.crop.findUnique({
          where: { id: resourceId },
          include: {
            field: {
              include: {
                farm: {
                  include: {
                    managers: {
                      where: { userId },
                      select: { userId: true }
                    }
                  }
                }
              }
            }
          }
        })

        if (!crop) return false

        // Farm owners have all permissions
        if (crop.field.farm.ownerId === userId) return true

        // Farm managers have read/write permissions
        if (crop.field.farm.managers.length > 0 && permission !== 'delete') return true

        return false

      default:
        return false
    }
  }
}