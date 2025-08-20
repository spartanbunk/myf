# Markyourfish.com

A comprehensive fishing catch logging application that allows users to mark their catches on an interactive map with detailed data tracking including species, conditions, and weather information.

## Features

- Interactive Google Maps with advanced marker functionality
- Click-to-mark fish catches with GPS coordinates
- Comprehensive catch data logging (species, depth, temperature, weight, length, lure type)
- Automatic weather data capture at catch time
- Photo upload capability for catches
- List and map views with filtering options
- Species-specific colored map markers
- Mobile-responsive design
- User authentication with Firebase
- Subscription management with Stripe

## Tech Stack

- **Frontend**: Vue.js 3, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with PostGIS
- **Cache**: Redis
- **Authentication**: Firebase Auth
- **Maps**: Google Maps API with Advanced Markers
- **Payments**: Stripe
- **Container**: Docker & Docker Compose
- **Storage**: AWS S3 (for photos)

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)
- PostgreSQL 15+ (if running without Docker)
- Redis 7+ (if running without Docker)
- Google Maps API key
- Firebase project configuration
- Stripe account (for payments)
- AWS S3 bucket (for photo storage)

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/yourusername/markyourfish.git
cd markyourfish
```

2. Copy environment variables:
```bash
cp .env.example .env
cp client/.env.example client/.env
```

3. Configure your environment variables in both `.env` files with your API keys and credentials.

4. Start the application with Docker Compose:
```bash
docker-compose up -d
```

5. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Development Setup

### Without Docker

1. Install dependencies:
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

2. Setup PostgreSQL database:
```bash
psql -U postgres -f database/init.sql
```

3. Start Redis:
```bash
redis-server
```

4. Start the backend server:
```bash
cd server
npm run dev
```

5. Start the frontend:
```bash
cd client
npm run dev
```

## Project Structure

```
markyourfish/
├── client/              # Vue.js frontend application
├── server/              # Express.js backend API
├── database/            # Database migrations and seeds
├── docker/              # Docker configuration files
├── docs/                # Documentation
├── docker-compose.yml   # Docker Compose configuration
└── README.md           # This file
```

## API Documentation

See [docs/API.md](docs/API.md) for detailed API documentation.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment instructions.

## Environment Variables

### Server (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret for JWT tokens
- `FIREBASE_SERVICE_ACCOUNT`: Firebase admin SDK configuration
- `STRIPE_SECRET_KEY`: Stripe secret key
- `AWS_ACCESS_KEY_ID`: AWS access key for S3
- `AWS_SECRET_ACCESS_KEY`: AWS secret key for S3
- `AWS_S3_BUCKET`: S3 bucket name for photos

### Client (client/.env)
- `VITE_API_URL`: Backend API URL
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `VITE_FIREBASE_CONFIG`: Firebase configuration object
- `VITE_STRIPE_PUBLIC_KEY`: Stripe publishable key

## Database Schema

The application uses PostgreSQL with PostGIS for spatial data:
- `users`: User accounts and subscription info
- `catches`: Fish catch records with location data
- `weather_data`: Weather conditions at catch time
- `species`: Fish species with color codes
- `lures`: Lure types
- `photos`: Catch photos

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues and questions, please create an issue in the GitHub repository.