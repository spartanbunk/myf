# Markyourfish.com Development Plan

## Project Overview
A fishing catch logging application that allows users to mark fish catches on Google Maps with comprehensive data logging including species, conditions, and weather information.

## Phase 1: Foundation Setup

### 1. Docker Environment & Project Structure
- Create complete folder structure as specified in rules.md
- Setup Docker Compose with multi-container architecture
- Configure environment variables for all services

### 2. Database Architecture
**PostgreSQL Schema Design:**
- **users table**: id, email, firebase_uid, created_at, subscription_status
- **catches table**: id, user_id, lat, lng, species, depth, water_temp, length, weight, lure_type, notes, photo_url, catch_date, catch_time, created_at
- **weather_data table**: id, catch_id, conditions, wind_speed, wind_direction, air_temp, lunar_phase, barometric_pressure, pressure_trend
- **species table**: id, name, color_code, icon_url
- **lures table**: id, name, category

### 3. Backend API Development
**Express Server Routes:**
- `/api/auth/*` - Authentication endpoints
- `/api/catches/*` - CRUD for fish catches
- `/api/weather/*` - Weather data fetching
- `/api/users/*` - User profile management
- `/api/upload/*` - Photo upload handling

## Phase 2: Core Features

### 4. Authentication System
- Firebase Auth integration with email/password and social providers
- JWT token validation middleware
- Redis session storage for active users
- Protected route implementation

### 5. Google Maps Integration
**Features:**
- Advanced Marker API implementation
- Click event handling for catch marking
- Custom marker icons per species with unique colors
- Marker clustering for performance
- Info windows with catch details

**Species Color Mapping:**
- Musky: #8B4513 (Brown)
- Pike: #228B22 (Green)
- Bass (Smallmouth): #4B0082 (Indigo)
- Bass (Largemouth): #006400 (Dark Green)
- Walleye: #FFD700 (Gold)
- Perch: #FFA500 (Orange)
- Bluegill: #4169E1 (Royal Blue)
- Catfish: #696969 (Gray)
- Trout: #FF69B4 (Pink)
- Salmon: #FA8072 (Salmon)
- Other: #800080 (Purple)

### 6. Log Catch Modal
**Form Fields:**
- Species (dropdown with "Other" option)
- Depth (number input)
- Water Temperature (number input)
- Length (number input)
- Weight (number input)
- Lure Type (dropdown with "Other" option)
- Photo Upload (file input)
- Notes (textarea)
- Catch Date (date picker)
- Catch Time (time picker)
- Weather Conditions (auto-populated dropdown)
- Wind Speed (auto-populated)
- Wind Direction (auto-populated)
- Air Temperature (auto-populated)
- Lunar Phase (auto-populated)
- Barometric Pressure (auto-populated with trend)

## Phase 3: Data & Views

### 7. Weather Integration
**National Weather Service API:**
- Endpoint: api.weather.gov
- Get point forecast based on lat/lng
- Cache responses in Redis (15-minute TTL)
- Fallback to manual entry if API fails

**Lunar Phase Calculation:**
- Implement lunar phase algorithm
- Display as: New Moon, Waxing Crescent, First Quarter, Waxing Gibbous, Full Moon, Waning Gibbous, Last Quarter, Waning Crescent

### 8. List View & Filtering
**Features:**
- Sortable columns: Date, Species, Weight, Length
- Filters: Species, Date Range, Location Radius
- Pagination: 20 items per page
- Export to CSV functionality

### 9. Mobile Optimization
- Responsive breakpoints: 640px, 768px, 1024px
- Touch-optimized map controls
- Swipe gestures for navigation
- Offline capability with service workers

## Phase 4: Polish & Production

### 10. Payment Processing
**Stripe Integration:**
- Subscription tiers: Free (10 catches/month), Pro ($9.99/month unlimited)
- Payment methods: Credit card, PayPal
- Webhook handling for subscription events

### 11. Performance Optimization
- Image optimization and lazy loading
- Code splitting with dynamic imports
- Redis caching strategy
- Database query optimization

## Technical Implementation Details

### Docker Compose Services
```yaml
services:
  client:
    build: ./docker/client.Dockerfile
    ports: ["3000:3000"]
  
  server:
    build: ./docker/server.Dockerfile
    ports: ["3001:3001"]
  
  postgres:
    image: postgres:latest
    environment:
      POSTGRES_DB: markyourfish
  
  redis:
    image: redis:latest
```

### Environment Variables
```
# Client
VITE_GOOGLE_MAPS_API_KEY=
VITE_FIREBASE_CONFIG=
VITE_STRIPE_PUBLIC_KEY=
VITE_API_URL=http://localhost:3001

# Server
DATABASE_URL=postgresql://user:pass@postgres:5432/markyourfish
REDIS_URL=redis://redis:6379
FIREBASE_SERVICE_ACCOUNT=
STRIPE_SECRET_KEY=
WEATHER_API_KEY=
PORT=3001
```

### API Endpoints

#### Catches
- `GET /api/catches` - List user's catches
- `POST /api/catches` - Create new catch
- `GET /api/catches/:id` - Get catch details
- `PUT /api/catches/:id` - Update catch
- `DELETE /api/catches/:id` - Delete catch

#### Weather
- `GET /api/weather/current?lat=&lng=` - Get current weather

#### Upload
- `POST /api/upload/photo` - Upload catch photo

## Development Timeline

### Week 1-2: Foundation
- Project setup and Docker configuration
- Database schema and migrations
- Basic Express API structure

### Week 3-4: Authentication & Maps
- Firebase authentication
- Google Maps integration
- Basic catch marking functionality

### Week 5-6: Core Features
- Log Catch modal implementation
- Weather API integration
- Photo upload functionality

### Week 7-8: Views & Filtering
- List view with filters
- Map view enhancements
- Mobile optimization

### Week 9-10: Production Ready
- Stripe payment integration
- Performance optimization
- Documentation and testing

## Testing Strategy
- Unit tests for API endpoints
- Integration tests for database operations
- E2E tests for critical user flows
- Performance testing for map with many markers

## Deployment Process
1. Build Docker images
2. Run database migrations
3. Deploy to cloud provider (AWS/GCP/Azure)
4. Configure SSL certificates
5. Setup monitoring and logging
6. Configure backup strategy

## Monitoring & Maintenance
- Error tracking with Sentry
- Performance monitoring
- Database backup schedule
- Security updates routine
- User feedback system

## Success Metrics
- Page load time < 3 seconds
- Map interaction latency < 100ms
- 99.9% uptime
- Mobile responsiveness score > 95
- User retention rate > 60%