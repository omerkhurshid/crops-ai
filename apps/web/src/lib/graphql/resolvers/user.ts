import { prisma } from '../../prisma'
import { GraphQLContext } from '../context'
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../api/errors'
export const userResolvers = {
  Query: {
    me: async (_: any, __: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      return await prisma.user.findUnique({
        where: { id: context.user.id }
      })
    },
    user: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const user = await prisma.user.findUnique({
        where: { id }
      })
      if (!user) {
        throw new NotFoundError('User not found')
      }
      // Only allow admins or the user themselves to view user details
      if (context.user.role !== 'ADMIN' && context.user.id !== id) {
        throw new AuthorizationError('Access denied')
      }
      return user
    },
    users: async (_: any, { pagination }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      // Only admins can list all users
      if (context.user.role !== 'ADMIN') {
        throw new AuthorizationError('Access denied')
      }
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {}
      const skip = (page - 1) * limit
      return await prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder }
      })
    },
  },
  Mutation: {
    createUser: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      // Only admins can create users
      if (context.user.role !== 'ADMIN') {
        throw new AuthorizationError('Access denied')
      }
      return await prisma.user.create({
        data: input
      })
    },
    updateUser: async (_: any, { id, input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      // Users can update themselves, admins can update anyone
      if (context.user.role !== 'ADMIN' && context.user.id !== id) {
        throw new AuthorizationError('Access denied')
      }
      const user = await prisma.user.findUnique({
        where: { id }
      })
      if (!user) {
        throw new NotFoundError('User not found')
      }
      return await prisma.user.update({
        where: { id },
        data: input
      })
    },
    deleteUser: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      // Only admins can delete users
      if (context.user.role !== 'ADMIN') {
        throw new AuthorizationError('Access denied')
      }
      const user = await prisma.user.findUnique({
        where: { id }
      })
      if (!user) {
        throw new NotFoundError('User not found')
      }
      await prisma.user.delete({
        where: { id }
      })
      return true
    },
  },
  User: {
    ownedFarms: async (parent: any) => {
      return await prisma.farm.findMany({
        where: { ownerId: parent.id }
      })
    },
    managedFarms: async (parent: any) => {
      return await prisma.farm.findMany({
        where: {
          managers: {
            some: { userId: parent.id }
          }
        }
      })
    },
  },
}