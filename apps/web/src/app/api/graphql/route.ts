import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { NextRequest } from 'next/server'
import { typeDefs } from '../../../lib/graphql/schema'
import { resolvers } from '../../../lib/graphql/resolvers'
import { createContext, GraphQLContext } from '../../../lib/graphql/context'
// Logger replaced with console for local development
// Create Apollo Server instance
const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV !== 'production',
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
  formatError: (err) => {
    // Log the error for monitoring
    console.error('GraphQL Error', {
      message: err.message,
      path: err.path,
      extensions: err.extensions
    })
    // Return sanitized error in production
    if (process.env.NODE_ENV === 'production') {
      // Don't expose internal error details in production
      if (err.extensions?.code === 'INTERNAL_SERVER_ERROR') {
        return new Error('Internal server error')
      }
    }
    return err
  },
  plugins: [
    // Performance monitoring plugin
    {
      async requestDidStart() {
        return {
          async didResolveOperation(requestContext: any) {
            // GraphQL operation logging removed for production
          },
          async willSendResponse(requestContext: any) {
            // GraphQL response logging removed for production
          }
        }
      }
    }
  ]
})
// Create the request handler
const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    return createContext(req)
  }
})
// Export handlers for Next.js App Router
export async function GET(request: NextRequest) {
  return handler(request)
}
export async function POST(request: NextRequest) {
  return handler(request)
}