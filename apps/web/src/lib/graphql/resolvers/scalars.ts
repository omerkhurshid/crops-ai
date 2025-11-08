import { GraphQLScalarType, Kind } from 'graphql'
import { GraphQLJSON } from 'graphql-type-json'
const DateTimeType = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    if (value instanceof Date) {
      return value.toISOString()
    }
    return new Date(value).toISOString()
  },
  parseValue(value: any) {
    return new Date(value)
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value)
    }
    return null
  },
})
const UploadType = new GraphQLScalarType({
  name: 'Upload',
  description: 'The `Upload` scalar type represents a file upload.',
  serialize() {
    throw new Error('Upload serialization is not supported')
  },
  parseValue(value: any) {
    return value
  },
  parseLiteral() {
    throw new Error('Upload literal parsing is not supported')
  },
})
export const scalarResolvers = {
  DateTime: DateTimeType,
  JSON: GraphQLJSON,
  Upload: UploadType,
}