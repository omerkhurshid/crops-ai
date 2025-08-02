# Crops.AI

AI-powered land and crop management platform designed to optimize agricultural productivity through intelligent decision-support, real-time monitoring, and predictive analytics.

## Overview

Crops.AI democratizes access to precision agriculture tools for farms of all sizes (0.1 to 10,000+ acres), serving both remote land owners and active farm managers.

## Key Features

- **Weather Intelligence**: Real-time weather data and hyperlocal forecasting
- **Satellite Monitoring**: Crop health tracking with NDVI analysis
- **AI Recommendations**: Intelligent insights for planting, irrigation, and harvest
- **Financial Tracking**: Cost management and ROI optimization
- **Mobile Support**: Offline-capable mobile app for field operations
- **Market Intelligence**: Commodity pricing and demand forecasting

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with PostGIS (Supabase/Neon)
- **Authentication**: NextAuth.js / Clerk
- **Hosting**: Vercel
- **Mobile**: React Native with Expo
- **AI/ML**: Python with TensorFlow/PyTorch, deployed on Modal/Replicate

## Project Structure

```
crops-ai/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # React Native mobile app
├── packages/
│   ├── shared/       # Shared types, utils, and constants
│   ├── ui/           # Shared UI components
│   └── database/     # Prisma schema and database utilities
├── docs/             # Documentation
└── scripts/          # Build and deployment scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd crops-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

## Development

### Available Scripts

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run lint` - Run ESLint across all packages
- `npm run test` - Run tests across all packages
- `npm run type-check` - Run TypeScript type checking

### Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## Architecture

### Design Principles

- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion

### Security

- No hardcoded credentials
- Input validation and sanitization
- Principle of least privilege
- Structured error handling

## Roadmap

See [PRD.md](PRD.md) for the complete product roadmap and feature specifications.

## License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.