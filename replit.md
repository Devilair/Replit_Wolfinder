# Wolfinder - Professional Directory Platform

## Overview

Wolfinder is a comprehensive professional directory platform built for the Italian market, connecting consumers with verified professionals through authentic reviews. The platform features a modern React frontend with a Node.js/Express backend, PostgreSQL database via Drizzle ORM, and Stripe integration for subscription management.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Framework**: Shadcn/UI components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL 16 with Drizzle ORM
- **Authentication**: JWT-based with bcrypt password hashing
- **Payment Processing**: Stripe integration for subscription management
- **Email Service**: SendGrid for transactional emails

### Database Design
- **ORM**: Drizzle with type-safe schema definitions
- **Migration Strategy**: Schema-first approach with automatic migrations
- **Key Entities**: Users, Professionals, Categories, Reviews, Subscriptions, Badges
- **Advanced Features**: Audit logging, moderation queues, professional analytics

## Key Components

### Authentication System
- JWT-based authentication with refresh token support
- Role-based access control (user, professional, admin, moderator)
- Multi-factor authentication support
- Account lockout and security event logging

### Professional Management
- Comprehensive professional profiles with verification system
- Badge system for achievements and quality indicators
- Subscription-based feature gating
- Geographic search with Nominatim geocoding
- Portfolio and service management

### Review System
- Verified review collection and moderation
- Helpful vote system for community validation
- Review response capabilities for professionals
- Flag system for inappropriate content

### Subscription Management
- Tiered subscription plans (Essentials, Professional, Expert, Enterprise)
- Feature gating based on subscription level
- Stripe integration for payment processing
- Usage tracking and limits enforcement

### Admin Dashboard
- Comprehensive analytics and monitoring
- User and professional management
- Review moderation tools
- Audit logging and security monitoring
- System alerts and performance metrics

## Data Flow

### User Registration Flow
1. User selects registration type (consumer/professional)
2. Form validation with Zod schemas
3. Password hashing and user creation
4. Email verification process
5. Professional profile setup (if applicable)

### Review Submission Flow
1. Authenticated user submits review
2. Automatic verification checks
3. Moderation queue processing
4. Professional notification
5. Badge system updates

### Subscription Flow
1. Professional selects subscription plan
2. Stripe checkout session creation
3. Payment processing and confirmation
4. Feature access activation
5. Usage tracking initialization

## External Dependencies

### Payment Processing
- **Stripe**: Complete payment infrastructure with webhook handling
- **Subscription Management**: Automated billing and plan changes
- **Security**: PCI DSS compliant payment processing

### Communication Services
- **SendGrid**: Transactional email delivery
- **Email Templates**: Professional communication workflows
- **Notification System**: Multi-channel user engagement

### Mapping and Geocoding
- **Nominatim/OpenStreetMap**: Free geocoding service
- **Leaflet**: Interactive map components
- **Geographic Search**: Location-based professional discovery

### Development Tools
- **Replit**: Cloud development environment
- **TypeScript**: Type safety across the stack
- **ESLint/Prettier**: Code quality and formatting

## Deployment Strategy

### Production Environment
- **Platform**: Replit Autoscale deployment
- **Build Process**: Vite production build with Express bundle
- **Environment Variables**: Secure configuration management
- **Database**: Neon PostgreSQL with connection pooling

### Development Workflow
- **Hot Reload**: Vite HMR for frontend development
- **API Proxy**: Development server with API routing
- **Database Migrations**: Automated schema updates
- **Type Safety**: End-to-end TypeScript integration

### Performance Optimization
- **Code Splitting**: Dynamic imports for route-based chunks
- **Image Optimization**: Efficient asset delivery
- **Caching Strategy**: Query caching with TanStack Query
- **Database Indexing**: Optimized queries for search and analytics

## Changelog

- June 14, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.