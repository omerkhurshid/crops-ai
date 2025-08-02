import { userResolvers } from './user'
import { farmResolvers } from './farm'
import { fieldResolvers } from './field'
import { cropResolvers } from './crop'
import { weatherResolvers } from './weather'
import { satelliteResolvers } from './satellite'
import { scalarResolvers } from './scalars'

export const resolvers = {
  ...scalarResolvers,
  Query: {
    ...userResolvers.Query,
    ...farmResolvers.Query,
    ...fieldResolvers.Query,
    ...cropResolvers.Query,
    ...weatherResolvers.Query,
    ...satelliteResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...farmResolvers.Mutation,
    ...fieldResolvers.Mutation,
    ...cropResolvers.Mutation,
    ...weatherResolvers.Mutation,
    ...satelliteResolvers.Mutation,
  },
  Subscription: {
    ...weatherResolvers.Subscription,
    ...satelliteResolvers.Subscription,
    ...cropResolvers.Subscription,
    ...farmResolvers.Subscription,
  },
  // Type resolvers
  User: userResolvers.User,
  Farm: farmResolvers.Farm,
  Field: fieldResolvers.Field,
  Crop: cropResolvers.Crop,
  WeatherData: weatherResolvers.WeatherData,
  SatelliteData: satelliteResolvers.SatelliteData,
}