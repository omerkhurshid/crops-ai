import { prisma } from '../../prisma'
import { GraphQLContext } from '../context'
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../api/errors'
export const farmResolvers = {
  Query: {
    farm: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const farm = await prisma.farm.findUnique({
        where: { id },
        include: {
          managers: {
            select: {
              user: {
                select: { id: true }
              }
            }
          }
        }
      })
      if (!farm) {
        throw new NotFoundError('Farm not found')
      }
      // Check access permissions
      const hasAccess = context.user?.role === 'ADMIN' ||
                       farm.ownerId === context.user?.id ||
                       farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this farm')
      }
      return farm
    },
    farms: async (_: any, { pagination, filters }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {}
      const skip = (page - 1) * limit
      let where = {}
      // Apply filters based on user role
      if (context.user.role === 'ADMIN') {
        // Admins can see all farms, apply only requested filters
        if (filters) {
          where = { ...filters }
        }
      } else {
        // Non-admins can only see farms they own or manage
        where = {
          OR: [
            { ownerId: context.user.id },
            { managers: { some: { userId: context.user.id } } }
          ],
          ...filters
        }
      }
      const [farms, total] = await Promise.all([
        prisma.farm.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.farm.count({ where })
      ])
      // Create connection format
      const edges = farms.map((farm: any, index: number) => ({
        node: farm,
        cursor: Buffer.from(`${skip + index}`).toString('base64')
      }))
      const pageInfo = {
        hasNextPage: skip + limit < total,
        hasPreviousPage: page > 1,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
      return { edges, pageInfo }
    },
    myFarms: async (_: any, { pagination }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {}
      const skip = (page - 1) * limit
      const where = {
        OR: [
          { ownerId: context.user.id },
          { managers: { some: { userId: context.user.id } } }
        ]
      }
      const [farms, total] = await Promise.all([
        prisma.farm.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.farm.count({ where })
      ])
      const edges = farms.map((farm: any, index: number) => ({
        node: farm,
        cursor: Buffer.from(`${skip + index}`).toString('base64')
      }))
      const pageInfo = {
        hasNextPage: skip + limit < total,
        hasPreviousPage: page > 1,
        startCursor: edges[0]?.cursor,
        endCursor: edges[edges.length - 1]?.cursor,
        totalCount: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page
      }
      return { edges, pageInfo }
    },
  },
  Mutation: {
    createFarm: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      return await prisma.farm.create({
        data: {
          ...input,
          ownerId: context.user.id
        }
      })
    },
    updateFarm: async (_: any, { id, input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const farm = await prisma.farm.findUnique({
        where: { id },
        select: { ownerId: true }
      })
      if (!farm) {
        throw new NotFoundError('Farm not found')
      }
      // Only farm owners and admins can update farm details
      if (context.user.role !== 'ADMIN' && farm.ownerId !== context.user.id) {
        throw new AuthorizationError('Only farm owners can update farm details')
      }
      return await prisma.farm.update({
        where: { id },
        data: input
      })
    },
    deleteFarm: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const farm = await prisma.farm.findUnique({
        where: { id },
        select: { ownerId: true }
      })
      if (!farm) {
        throw new NotFoundError('Farm not found')
      }
      // Only farm owners and admins can delete farms
      if (context.user.role !== 'ADMIN' && farm.ownerId !== context.user.id) {
        throw new AuthorizationError('Only farm owners can delete farms')
      }
      await prisma.farm.delete({
        where: { id }
      })
      return true
    },
    addFarmManager: async (_: any, { farmId, userId }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        select: { ownerId: true }
      })
      if (!farm) {
        throw new NotFoundError('Farm not found')
      }
      // Only farm owners and admins can add managers
      if (context.user.role !== 'ADMIN' && farm.ownerId !== context.user.id) {
        throw new AuthorizationError('Only farm owners can add managers')
      }
      // Add the manager relationship
      await prisma.farmManager.create({
        data: {
          farmId,
          userId
        }
      })
      return await prisma.farm.findUnique({
        where: { id: farmId }
      })
    },
    removeFarmManager: async (_: any, { farmId, userId }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const farm = await prisma.farm.findUnique({
        where: { id: farmId },
        select: { ownerId: true }
      })
      if (!farm) {
        throw new NotFoundError('Farm not found')
      }
      // Only farm owners and admins can remove managers
      if (context.user.role !== 'ADMIN' && farm.ownerId !== context.user.id) {
        throw new AuthorizationError('Only farm owners can remove managers')
      }
      await prisma.farmManager.delete({
        where: {
          farmId_userId: {
            farmId,
            userId
          }
        }
      })
      return await prisma.farm.findUnique({
        where: { id: farmId }
      })
    },
  },
  Subscription: {
    farmUpdated: {
      // Placeholder for subscription implementation
      subscribe: () => {
        // Implementation would use something like Redis pub/sub or GraphQL subscriptions
        throw new Error('Subscriptions not yet implemented')
      }
    },
  },
  Farm: {
    owner: async (parent: any) => {
      return await prisma.user.findUnique({
        where: { id: parent.ownerId }
      })
    },
    managers: async (parent: any) => {
      const farmManagers = await prisma.farmManager.findMany({
        where: { farmId: parent.id },
        include: { user: true }
      })
      return farmManagers.map((fm: any) => fm.user)
    },
    fields: async (parent: any) => {
      return await prisma.field.findMany({
        where: { farmId: parent.id }
      })
    },
  },
}