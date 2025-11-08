import { prisma } from '../../prisma'
import { GraphQLContext } from '../context'
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../api/errors'
export const fieldResolvers = {
  Query: {
    field: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const field = await prisma.field.findUnique({
        where: { id },
        include: {
          farm: {
            include: {
              managers: {
                select: {
                  user: { select: { id: true } }
                }
              }
            }
          }
        }
      })
      if (!field) {
        throw new NotFoundError('Field not found')
      }
      // Check access permissions
      const hasAccess = context.user?.role === 'ADMIN' ||
                       field.farm.ownerId === context.user?.id ||
                       field.farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this field')
      }
      return field
    },
    fields: async (_: any, { pagination, filters }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = pagination || {}
      const skip = (page - 1) * limit
      let where = {}
      // Apply access control based on user role
      if (context.user.role === 'ADMIN') {
        where = { ...filters }
      } else {
        where = {
          farm: {
            OR: [
              { ownerId: context.user.id },
              { managers: { some: { userId: context.user.id } } }
            ]
          },
          ...filters
        }
      }
      const [fields, total] = await Promise.all([
        prisma.field.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.field.count({ where })
      ])
      const edges = fields.map((field: any, index: number) => ({
        node: field,
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
    createField: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      // Check if user has access to the farm
      const farm = await prisma.farm.findUnique({
        where: { id: input.farmId },
        include: {
          managers: {
            select: {
              user: { select: { id: true } }
            }
          }
        }
      })
      if (!farm) {
        throw new NotFoundError('Farm not found')
      }
      const hasAccess = context.user?.role === 'ADMIN' ||
                       farm.ownerId === context.user?.id ||
                       farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this farm')
      }
      return await prisma.field.create({
        data: input
      })
    },
    updateField: async (_: any, { id, input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const field = await prisma.field.findUnique({
        where: { id },
        include: {
          farm: {
            include: {
              managers: {
                select: {
                  user: { select: { id: true } }
                }
              }
            }
          }
        }
      })
      if (!field) {
        throw new NotFoundError('Field not found')
      }
      const hasAccess = context.user?.role === 'ADMIN' ||
                       field.farm.ownerId === context.user?.id ||
                       field.farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this field')
      }
      return await prisma.field.update({
        where: { id },
        data: input
      })
    },
    deleteField: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const field = await prisma.field.findUnique({
        where: { id },
        include: {
          farm: {
            include: {
              managers: {
                select: {
                  user: { select: { id: true } }
                }
              }
            }
          }
        }
      })
      if (!field) {
        throw new NotFoundError('Field not found')
      }
      const hasAccess = context.user?.role === 'ADMIN' ||
                       field.farm.ownerId === context.user?.id ||
                       field.farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this field')
      }
      await prisma.field.delete({
        where: { id }
      })
      return true
    },
  },
  Field: {
    farm: async (parent: any) => {
      return await prisma.farm.findUnique({
        where: { id: parent.farmId }
      })
    },
    crops: async (parent: any) => {
      return await prisma.crop.findMany({
        where: { fieldId: parent.id }
      })
    },
    currentCrop: async (parent: any) => {
      return await prisma.crop.findFirst({
        where: {
          fieldId: parent.id,
          status: {
            in: ['PLANTED', 'GROWING', 'READY_TO_HARVEST']
          }
        },
        orderBy: { plantingDate: 'desc' }
      })
    },
    weatherData: async (parent: any) => {
      return await prisma.weatherData.findMany({
        where: { fieldId: parent.id },
        orderBy: { timestamp: 'desc' },
        take: 10 // Latest 10 records
      })
    },
    satelliteData: async (parent: any) => {
      return await prisma.satelliteData.findMany({
        where: { fieldId: parent.id },
        orderBy: { captureDate: 'desc' },
        take: 10 // Latest 10 records
      })
    },
  },
}