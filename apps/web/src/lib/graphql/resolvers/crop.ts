import { prisma } from '../../prisma'
import { GraphQLContext } from '../context'
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../api/errors'
export const cropResolvers = {
  Query: {
    crop: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const crop = await prisma.crop.findUnique({
        where: { id },
        include: {
          field: {
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
          }
        }
      })
      if (!crop) {
        throw new NotFoundError('Crop not found')
      }
      // Check access permissions
      const hasAccess = context.user?.role === 'ADMIN' ||
                       crop.field.farm.ownerId === context.user?.id ||
                       crop.field.farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this crop')
      }
      return crop
    },
    crops: async (_: any, { pagination, filters }: any, context: GraphQLContext) => {
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
          field: {
            farm: {
              OR: [
                { ownerId: context.user.id },
                { managers: { some: { userId: context.user.id } } }
              ]
            }
          },
          ...filters
        }
      }
      const [crops, total] = await Promise.all([
        prisma.crop.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder }
        }),
        prisma.crop.count({ where })
      ])
      const edges = crops.map((crop: any, index: number) => ({
        node: crop,
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
    createCrop: async (_: any, { input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      // Check if user has access to the field
      const field = await prisma.field.findUnique({
        where: { id: input.fieldId },
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
      return await prisma.crop.create({
        data: input
      })
    },
    updateCrop: async (_: any, { id, input }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const crop = await prisma.crop.findUnique({
        where: { id },
        include: {
          field: {
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
          }
        }
      })
      if (!crop) {
        throw new NotFoundError('Crop not found')
      }
      const hasAccess = context.user?.role === 'ADMIN' ||
                       crop.field.farm.ownerId === context.user?.id ||
                       crop.field.farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this crop')
      }
      return await prisma.crop.update({
        where: { id },
        data: input
      })
    },
    deleteCrop: async (_: any, { id }: { id: string }, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const crop = await prisma.crop.findUnique({
        where: { id },
        include: {
          field: {
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
          }
        }
      })
      if (!crop) {
        throw new NotFoundError('Crop not found')
      }
      const hasAccess = context.user?.role === 'ADMIN' ||
                       crop.field.farm.ownerId === context.user?.id ||
                       crop.field.farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this crop')
      }
      await prisma.crop.delete({
        where: { id }
      })
      return true
    },
    harvestCrop: async (_: any, { id, yield: yieldValue }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }
      const crop = await prisma.crop.findUnique({
        where: { id },
        include: {
          field: {
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
          }
        }
      })
      if (!crop) {
        throw new NotFoundError('Crop not found')
      }
      const hasAccess = context.user?.role === 'ADMIN' ||
                       crop.field.farm.ownerId === context.user?.id ||
                       crop.field.farm.managers.some((m: any) => m.user.id === context.user?.id)
      if (!hasAccess) {
        throw new AuthorizationError('Access denied to this crop')
      }
      return await prisma.crop.update({
        where: { id },
        data: {
          status: 'HARVESTED',
          actualHarvestDate: new Date(),
          yield: yieldValue
        }
      })
    },
  },
  Subscription: {
    cropStatusChanged: {
      subscribe: () => {
        throw new Error('Subscriptions not yet implemented')
      }
    },
  },
  Crop: {
    field: async (parent: any) => {
      return await prisma.field.findUnique({
        where: { id: parent.fieldId }
      })
    },
  },
}