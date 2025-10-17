import { prisma } from '../../prisma'
import { GraphQLContext } from '../context'
import { AuthenticationError, AuthorizationError, NotFoundError } from '../../api/errors'

export const weatherResolvers = {
  Query: {
    weatherForecast: async (_: any, { fieldId, days }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }

      // Check if user has access to the field
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
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

      // Weather forecast API integration uses OpenWeatherMap service
      // For now, return mock data
      const forecast = []
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        
        forecast.push({
          date,
          minTemp: 15 + Math.random() * 10,
          maxTemp: 25 + Math.random() * 10,
          precipitationProbability: Math.random() * 100,
          precipitationAmount: Math.random() * 10,
          conditions: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy'][Math.floor(Math.random() * 4)]
        })
      }

      return forecast
    },

    weatherHistory: async (_: any, { fieldId, from, to }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }

      // Check if user has access to the field
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
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

      return await prisma.weatherData.findMany({
        where: {
          fieldId,
          timestamp: {
            gte: from,
            lte: to
          }
        },
        orderBy: { timestamp: 'asc' }
      })
    },
  },

  Mutation: {
    ingestWeatherData: async (_: any, { fieldId }: any, context: GraphQLContext) => {
      if (!context.user) {
        throw new AuthenticationError()
      }

      // Check if user has access to the field
      const field = await prisma.field.findUnique({
        where: { id: fieldId },
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

      // Weather data ingestion uses OpenWeatherMap and agriculture APIs
      // For now, create mock weather data
      const weatherData = await prisma.weatherData.create({
        data: {
          fieldId,
          timestamp: new Date(),
          temperature: 20 + Math.random() * 15,
          humidity: 40 + Math.random() * 40,
          precipitation: Math.random() * 5,
          windSpeed: Math.random() * 20,
          windDirection: Math.random() * 360,
          pressure: 980 + Math.random() * 60,
          cloudCover: Math.random() * 100
        }
      })

      return [weatherData]
    },
  },

  Subscription: {
    weatherDataUpdated: {
      subscribe: () => {
        throw new Error('Subscriptions not yet implemented')
      }
    },
  },

  WeatherData: {
    field: async (parent: any) => {
      return await prisma.field.findUnique({
        where: { id: parent.fieldId }
      })
    },
  },
}