# User Roles & Subscription System Plan

## Overview
This document outlines the complete plan for implementing user roles and a simplified subscription system for the Mark Your Fish application.

## Current State Analysis
- **User table exists** with basic fields: id, email, firebase_uid, username, subscription_status, subscription_expires_at, catches_count
- **Schema inconsistency**: Auth system expects password field but schema uses Firebase UID
- **Missing profile fields** referenced in user routes but not in database
- **Basic subscription system** already partially implemented

## Subscription Tiers

### Free Tier (Default)
- **Price**: $0/month
- **Catch Limit**: 5 catches maximum
- **Features**: 
  - Basic catch logging
  - Map visualization
  - Basic catch details
  - Photo uploads
  - Weather data integration

### Pro Tier
- **Price**: $2.99/month
- **Catch Limit**: Unlimited catches
- **Features**:
  - All Free tier features
  - Unlimited catch logging
  - Advanced analytics and charts
  - Export capabilities (CSV, PDF)
  - Social features (public profiles, sharing)
  - Advanced search and filtering
  - Cloud backup and sync

### Master Tier
- **Price**: $9.99/month
- **Catch Limit**: Unlimited catches
- **Features**:
  - All Pro tier features
  - **AI Predictive Analytics**: Fish behavior predictions, best fishing time recommendations, location suggestions
  - **Voice Prompting**: Voice-activated catch logging, voice commands for app navigation
  - Priority customer support
  - Beta access to new features
  - Advanced API access

## User Roles

### Angler (Default Role)
- **Target**: Regular users of the app
- **Permissions**:
  - Log and manage own catches
  - View own catch history and analytics
  - Edit own profile and privacy settings
  - Access features based on subscription tier
  - Share catches publicly (Pro+ only)
  - Use social features (Pro+ only)

### Admin
- **Target**: App administrators and support staff
- **Permissions**:
  - All Angler permissions (with Master tier features)
  - View and manage all user accounts
  - Access admin dashboard and system analytics
  - Manage user subscriptions and billing
  - Moderate content and user reports
  - Access system logs and diagnostics
  - Manage app settings and configurations

## Database Schema Updates

### Phase 1: Core Fields Addition

```sql
-- Add to existing users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'angler' 
  CHECK (role IN ('angler', 'admin'));

ALTER TABLE users ADD COLUMN account_status VARCHAR(20) DEFAULT 'active' 
  CHECK (account_status IN ('active', 'suspended', 'deactivated'));

ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT false;

-- Update subscription system
ALTER TABLE users DROP COLUMN subscription_status;
ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(20) DEFAULT 'free' 
  CHECK (subscription_plan IN ('free', 'pro', 'master'));

ALTER TABLE users ADD COLUMN subscription_tier INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN stripe_customer_id VARCHAR(100);
ALTER TABLE users ADD COLUMN subscription_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN catch_limit_monthly INTEGER DEFAULT 5;
ALTER TABLE users ADD COLUMN trial_ends_at TIMESTAMP;
```

### Phase 2: Profile Enhancement

```sql
-- Essential profile fields
ALTER TABLE users ADD COLUMN first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN display_name VARCHAR(100);
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN profile_picture_url VARCHAR(500);

-- App preferences
ALTER TABLE users ADD COLUMN preferred_units VARCHAR(20) DEFAULT 'imperial' 
  CHECK (preferred_units IN ('metric', 'imperial'));
ALTER TABLE users ADD COLUMN theme_preference VARCHAR(20) DEFAULT 'auto' 
  CHECK (theme_preference IN ('light', 'dark', 'auto'));

-- Privacy settings
ALTER TABLE users ADD COLUMN is_profile_public BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN show_location_on_catches BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN show_catch_stats BOOLEAN DEFAULT true;
```

### Phase 3: Advanced Features

```sql
-- Location and fishing preferences
ALTER TABLE users ADD COLUMN home_location VARCHAR(255);
ALTER TABLE users ADD COLUMN home_latitude DECIMAL(10,8);
ALTER TABLE users ADD COLUMN home_longitude DECIMAL(11,8);
ALTER TABLE users ADD COLUMN preferred_species TEXT[];

-- Analytics and tracking
ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN total_fishing_days INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN biggest_catch_weight DECIMAL(6,2);
ALTER TABLE users ADD COLUMN biggest_catch_species VARCHAR(100);
```

## Implementation Strategy

### Step 1: Database Migration
1. Create migration file for Phase 1 fields
2. Set appropriate defaults for existing users
3. Update catch limits for current users based on their current subscription_status

### Step 2: Backend Updates
1. Update User model with new fields and validations
2. Implement role-based middleware for route protection
3. Add subscription tier checking logic
4. Update catch creation to enforce limits
5. Create admin-only routes and controllers

### Step 3: Frontend Integration
1. Add subscription upgrade prompts when catch limit reached
2. Implement role-based UI elements (admin panels)
3. Create profile editing forms with new fields
4. Add subscription management interface
5. Implement voice prompting for Master tier users
6. Add AI analytics dashboard for Master tier users

### Step 4: Payment Integration
1. Integrate Stripe for subscription management
2. Create webhook handlers for subscription events
3. Implement trial period logic
4. Add billing history and invoice management

## Catch Limit Enforcement

### Database Trigger Update
```sql
-- Update existing catch counting trigger to enforce limits
CREATE OR REPLACE FUNCTION enforce_catch_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Check user's catch limit based on subscription
    IF (SELECT catch_limit_monthly FROM users WHERE id = NEW.user_id) <= 
       (SELECT catches_count FROM users WHERE id = NEW.user_id) THEN
        RAISE EXCEPTION 'Monthly catch limit exceeded. Please upgrade your subscription.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER catch_limit_trigger
    BEFORE INSERT ON catches
    FOR EACH ROW
    EXECUTE FUNCTION enforce_catch_limit();
```

## Subscription Tier Logic

### Monthly Limits Reset
```sql
-- Function to reset monthly catch counts (run monthly via cron)
CREATE OR REPLACE FUNCTION reset_monthly_catch_counts()
RETURNS void AS $$
BEGIN
    UPDATE users SET catches_count = 0 WHERE subscription_plan = 'free';
    -- Pro and Master have unlimited, so no reset needed
END;
$$ LANGUAGE plpgsql;
```

## Feature Access Control

### Backend Middleware
```javascript
// Subscription tier checking middleware
const requireSubscription = (requiredTier) => {
  const tierLevels = { free: 1, pro: 2, master: 3 };
  
  return (req, res, next) => {
    const userTier = req.user.subscription_tier;
    const required = tierLevels[requiredTier];
    
    if (userTier < required) {
      return res.status(403).json({
        error: 'Subscription upgrade required',
        requiredTier,
        currentTier: Object.keys(tierLevels)[userTier - 1]
      });
    }
    
    next();
  };
};
```

## Migration Timeline

### Week 1: Core Infrastructure
- Database schema Phase 1 implementation
- Basic role and subscription backend logic
- Catch limit enforcement

### Week 2: User Interface
- Subscription upgrade UI
- Profile management forms
- Role-based navigation

### Week 3: Advanced Features
- Voice prompting implementation (Master tier)
- AI analytics integration (Master tier)
- Payment system integration

### Week 4: Testing & Deployment
- End-to-end testing
- Subscription flow testing
- Production deployment

## Success Metrics
- Free to Pro conversion rate target: 15%
- Pro to Master conversion rate target: 25%
- Monthly churn rate target: <5%
- User engagement increase post-subscription: 40%

## Future Considerations
- Annual subscription discounts (2 months free)
- Family/team plans
- Enterprise features for fishing guides and charters
- Integration with fishing license databases
- Advanced social features and competitions