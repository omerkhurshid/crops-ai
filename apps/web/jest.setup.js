import '@testing-library/jest-dom'

// Mock NextAuth
jest.mock('next-auth', () => ({
  default: jest.fn(),
}))

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  SessionProvider: ({ children }) => children,
}))

jest.mock('next-auth/jwt', () => ({
  getToken: jest.fn().mockResolvedValue(null),
}))

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserByEmail: jest.fn(),
    getUserByAccount: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    linkAccount: jest.fn(),
    unlinkAccount: jest.fn(),
  }))
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

// Mock environment variables
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.NODE_ENV = 'test'
process.env.UPSTASH_REDIS_REST_URL = 'http://test-redis-url'
process.env.UPSTASH_REDIS_REST_TOKEN = 'test-redis-token'
process.env.SUPABASE_URL = 'http://test-supabase-url'
process.env.SUPABASE_ANON_KEY = 'test-supabase-key'

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to silence console.log in tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}

// Mock fetch globally
global.fetch = jest.fn()

// Mock Upstash Redis
jest.mock('@upstash/redis', () => ({
  Redis: jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    ping: jest.fn().mockResolvedValue('PONG'),
  })),
}))

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      user: null,
    },
  })),
}))

// Mock Prisma
jest.mock('@crops-ai/database', () => ({
  prisma: {
    $queryRaw: jest.fn().mockResolvedValue([{ result: 1 }]),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    farm: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    field: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}))

// Mock shared services
jest.mock('@crops-ai/shared', () => ({
  Logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    setContext: jest.fn(),
    clearContext: jest.fn(),
  },
  redis: {
    get: jest.fn().mockResolvedValue('ok'),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    ping: jest.fn().mockResolvedValue('PONG'),
  },
  CacheService: {
    get: jest.fn().mockResolvedValue('ok'),
    set: jest.fn().mockResolvedValue(true),
    del: jest.fn().mockResolvedValue(true),
    ping: jest.fn().mockResolvedValue('PONG'),
  },
  PerformanceMonitor: {
    measureAsync: jest.fn().mockImplementation(async (name, fn) => {
      return await fn()
    }),
    measure: jest.fn().mockImplementation((name, fn) => {
      return fn()
    }),
  },
  UserRole: {
    USER: 'USER',
    ADMIN: 'ADMIN',
    PREMIUM: 'PREMIUM',
  },
}))