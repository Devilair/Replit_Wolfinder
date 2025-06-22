// Configuration file for environment variables and app settings
export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/wolfinder',
  },

  // Stripe Configuration
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    currency: 'eur',
    defaultBillingCycle: 'monthly',
  },

  // Email Configuration
  email: {
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.FROM_EMAIL || 'noreply@wolfinder.it',
    fromName: process.env.FROM_NAME || 'Wolfinder',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT || '5000'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/zip'
    ],
    uploadPath: process.env.UPLOAD_PATH || './uploads',
  },

  // Subscription Plans Configuration
  subscriptionPlans: {
    essentials: {
      id: 1,
      name: 'Essentials',
      priceMonthly: 0,
      priceYearly: 0,
      features: ['Profilo base', '1 foto', '3 servizi', 'Verifica standard']
    },
    professional: {
      id: 2,
      name: 'Professional',
      priceMonthly: 39,
      priceYearly: 390,
      features: ['Profilo completo', '10 foto', 'Servizi illimitati', 'Statistiche base', 'Badge meritocratici']
    },
    expert: {
      id: 3,
      name: 'Expert',
      priceMonthly: 79,
      priceYearly: 790,
      features: ['Tutto di Professional', 'Posizionamento prioritario', 'Analytics avanzate', 'Verifica PLUS']
    },
    enterprise: {
      id: 4,
      name: 'Enterprise',
      priceMonthly: 149,
      priceYearly: 1490,
      features: ['Tutto di Expert', 'Supporto dedicato', 'API access', 'Multi-location']
    }
  },

  // Badge Configuration
  badges: {
    cacheTimeout: 5 * 60 * 1000, // 5 minutes
    performanceTarget: 150, // ms
  },

  // Geocoding Configuration
  geocoding: {
    provider: 'nominatim',
    baseUrl: 'https://nominatim.openstreetmap.org',
    rateLimit: 1000, // requests per hour
    cacheTimeout: 24 * 60 * 60 * 1000, // 24 hours
  }
};

// Validation function to check required environment variables
export function validateConfig() {
  const required = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn('⚠️  Missing environment variables:', missing.join(', '));
    console.warn('Some features may not work correctly in production.');
  }

  return missing.length === 0;
}

// Export individual config sections for convenience
export const { stripe, email, jwt, server, upload, subscriptionPlans, badges, geocoding } = config; 