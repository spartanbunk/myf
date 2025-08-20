const express = require('express');
const axios = require('axios');
const { query, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock database/cache connection - replace with actual connections
// const db = require('../config/database');
// const redis = require('../config/redis');

// Authentication middleware (optional for some weather endpoints)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.userId = decoded.userId;
    } catch (error) {
      // Continue without authentication if token is invalid
      console.log('Invalid token in optional auth:', error.message);
    }
  }
  
  next();
};

// Validation middleware
const validateCoordinates = [
  query('lat').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lon').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
];

const validateLocation = [
  query('location').trim().isLength({ min: 1 }).withMessage('Location is required')
];

// Helper function to get weather data from API
const getWeatherFromAPI = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric'
      },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Weather API error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Weather API request timed out');
    } else {
      throw new Error('Failed to fetch weather data');
    }
  }
};

// Helper function to get forecast data from API
const getForecastFromAPI = async (lat, lon) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    const response = await axios.get('https://api.openweathermap.org/data/2.5/forecast', {
      params: {
        lat,
        lon,
        appid: apiKey,
        units: 'metric',
        cnt: 40 // 5-day forecast with 3-hour intervals
      },
      timeout: 10000
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Forecast API error: ${error.response.data.message || error.response.statusText}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Forecast API request timed out');
    } else {
      throw new Error('Failed to fetch forecast data');
    }
  }
};

// Helper function to calculate fishing conditions
const calculateFishingConditions = (weather) => {
  let score = 50; // Base score
  const conditions = [];

  // Temperature scoring (optimal 15-25°C for most fish)
  const temp = weather.main.temp;
  if (temp >= 15 && temp <= 25) {
    score += 20;
    conditions.push('Good temperature for fishing');
  } else if (temp >= 10 && temp <= 30) {
    score += 10;
    conditions.push('Acceptable temperature');
  } else {
    score -= 10;
    conditions.push('Temperature not ideal for fishing');
  }

  // Wind scoring (light breeze is good)
  const windSpeed = weather.wind?.speed || 0;
  if (windSpeed >= 2 && windSpeed <= 7) {
    score += 15;
    conditions.push('Light breeze creates good water movement');
  } else if (windSpeed < 2) {
    score -= 5;
    conditions.push('Very calm conditions may reduce fish activity');
  } else {
    score -= 15;
    conditions.push('Strong winds may make fishing difficult');
  }

  // Pressure trend (would need historical data, using current pressure)
  const pressure = weather.main.pressure;
  if (pressure >= 1013 && pressure <= 1023) {
    score += 10;
    conditions.push('Stable barometric pressure');
  } else if (pressure < 1000) {
    score -= 10;
    conditions.push('Low pressure may reduce fish activity');
  }

  // Weather conditions
  const mainWeather = weather.weather[0].main.toLowerCase();
  if (mainWeather.includes('rain')) {
    score -= 15;
    conditions.push('Rain may reduce visibility and comfort');
  } else if (mainWeather.includes('cloud')) {
    score += 10;
    conditions.push('Overcast conditions often good for fishing');
  } else if (mainWeather.includes('clear')) {
    score += 5;
    conditions.push('Clear skies provide good visibility');
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  let rating;
  if (score >= 75) rating = 'excellent';
  else if (score >= 60) rating = 'good';
  else if (score >= 45) rating = 'fair';
  else rating = 'poor';

  return {
    score,
    rating,
    conditions,
    recommendations: generateFishingRecommendations(weather, score)
  };
};

// Helper function to generate fishing recommendations
const generateFishingRecommendations = (weather, score) => {
  const recommendations = [];
  const temp = weather.main.temp;
  const windSpeed = weather.wind?.speed || 0;
  const mainWeather = weather.weather[0].main.toLowerCase();

  if (temp < 10) {
    recommendations.push('Consider deeper waters where fish may be more active');
    recommendations.push('Use slow-moving baits in cold water');
  } else if (temp > 25) {
    recommendations.push('Fish early morning or evening when it\'s cooler');
    recommendations.push('Look for shaded areas or deeper water');
  }

  if (windSpeed > 10) {
    recommendations.push('Find sheltered areas to avoid strong winds');
    recommendations.push('Use heavier tackle to maintain control');
  } else if (windSpeed < 1) {
    recommendations.push('Try areas with current or structure to find active fish');
  }

  if (mainWeather.includes('rain')) {
    recommendations.push('Consider postponing trip or find covered fishing spots');
  } else if (mainWeather.includes('cloud')) {
    recommendations.push('Great time for surface fishing');
    recommendations.push('Fish may be more active in overcast conditions');
  }

  if (score >= 70) {
    recommendations.push('Excellent conditions - try various techniques');
  } else if (score < 45) {
    recommendations.push('Consider waiting for better conditions');
  }

  return recommendations;
};

// GET /api/weather/current - Get current weather for coordinates
router.get('/current', optionalAuth, validateCoordinates, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { lat, lon } = req.query;

    // TODO: Check cache first
    // const cacheKey = `weather:current:${lat}:${lon}`;
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return res.json(JSON.parse(cached));
    // }

    // Get weather data from API (or use mock data if API key not available)
    let weatherData;
    try {
      weatherData = await getWeatherFromAPI(parseFloat(lat), parseFloat(lon));
    } catch (error) {
      console.error('Weather API error:', error.message);
      
      // Mock weather data for development
      weatherData = {
        coord: { lat: parseFloat(lat), lon: parseFloat(lon) },
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        main: {
          temp: 22,
          feels_like: 24,
          temp_min: 20,
          temp_max: 25,
          pressure: 1015,
          humidity: 65
        },
        visibility: 10000,
        wind: { speed: 3.5, deg: 180 },
        clouds: { all: 10 },
        dt: Math.floor(Date.now() / 1000),
        sys: { sunrise: Math.floor(Date.now() / 1000) - 3600, sunset: Math.floor(Date.now() / 1000) + 3600 },
        name: 'Sample Location'
      };
    }

    // Calculate fishing conditions
    const fishingConditions = calculateFishingConditions(weatherData);

    const response = {
      weather: {
        location: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          name: weatherData.name
        },
        current: {
          temperature: weatherData.main.temp,
          feelsLike: weatherData.main.feels_like,
          humidity: weatherData.main.humidity,
          pressure: weatherData.main.pressure,
          visibility: weatherData.visibility / 1000, // Convert to km
          wind: {
            speed: weatherData.wind.speed,
            direction: weatherData.wind.deg,
            gust: weatherData.wind.gust
          },
          clouds: weatherData.clouds.all,
          conditions: weatherData.weather[0],
          sunrise: new Date(weatherData.sys.sunrise * 1000).toISOString(),
          sunset: new Date(weatherData.sys.sunset * 1000).toISOString(),
          timestamp: new Date(weatherData.dt * 1000).toISOString()
        },
        fishing: fishingConditions
      }
    };

    // TODO: Cache the result for 10 minutes
    // await redis.setex(cacheKey, 600, JSON.stringify(response));

    res.json(response);

  } catch (error) {
    console.error('Get current weather error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// GET /api/weather/forecast - Get weather forecast for coordinates
router.get('/forecast', optionalAuth, validateCoordinates, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { lat, lon, days = 5 } = req.query;
    const maxDays = Math.min(parseInt(days), 5);

    // TODO: Check cache first
    // const cacheKey = `weather:forecast:${lat}:${lon}:${maxDays}`;
    // const cached = await redis.get(cacheKey);
    // if (cached) {
    //   return res.json(JSON.parse(cached));
    // }

    // Get forecast data from API (or use mock data if API key not available)
    let forecastData;
    try {
      forecastData = await getForecastFromAPI(parseFloat(lat), parseFloat(lon));
    } catch (error) {
      console.error('Forecast API error:', error.message);
      
      // Mock forecast data for development
      const mockForecasts = [];
      for (let i = 0; i < maxDays * 8; i++) {
        const date = new Date();
        date.setHours(date.getHours() + i * 3);
        
        mockForecasts.push({
          dt: Math.floor(date.getTime() / 1000),
          main: {
            temp: 20 + Math.random() * 10,
            temp_min: 18 + Math.random() * 8,
            temp_max: 22 + Math.random() * 8,
            pressure: 1010 + Math.random() * 20,
            humidity: 50 + Math.random() * 40
          },
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
          wind: { speed: 2 + Math.random() * 5, deg: Math.random() * 360 },
          clouds: { all: Math.random() * 100 },
          visibility: 10000,
          pop: Math.random() * 0.3 // Probability of precipitation
        });
      }
      
      forecastData = {
        city: { name: 'Sample Location', coord: { lat: parseFloat(lat), lon: parseFloat(lon) } },
        list: mockForecasts
      };
    }

    // Process forecast data
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = {
          date,
          forecasts: [],
          daily: {
            tempMin: item.main.temp_min,
            tempMax: item.main.temp_max,
            humidity: item.main.humidity,
            pressure: item.main.pressure,
            windSpeed: item.wind.speed,
            conditions: item.weather[0],
            precipitationChance: item.pop || 0
          }
        };
      } else {
        // Update daily min/max
        dailyForecasts[date].daily.tempMin = Math.min(dailyForecasts[date].daily.tempMin, item.main.temp_min);
        dailyForecasts[date].daily.tempMax = Math.max(dailyForecasts[date].daily.tempMax, item.main.temp_max);
        dailyForecasts[date].daily.precipitationChance = Math.max(dailyForecasts[date].daily.precipitationChance, item.pop || 0);
      }
      
      dailyForecasts[date].forecasts.push({
        time: new Date(item.dt * 1000).toISOString(),
        temperature: item.main.temp,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        wind: {
          speed: item.wind.speed,
          direction: item.wind.deg
        },
        conditions: item.weather[0],
        precipitationChance: item.pop || 0,
        fishing: calculateFishingConditions(item)
      });
    });

    // Convert to array and limit days
    const forecastArray = Object.values(dailyForecasts)
      .slice(0, maxDays)
      .map(day => ({
        ...day,
        fishing: calculateFishingConditions({
          main: {
            temp: (day.daily.tempMin + day.daily.tempMax) / 2,
            pressure: day.daily.pressure
          },
          wind: { speed: day.daily.windSpeed },
          weather: [day.daily.conditions]
        })
      }));

    const response = {
      forecast: {
        location: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          name: forecastData.city.name
        },
        days: forecastArray
      }
    };

    // TODO: Cache the result for 30 minutes
    // await redis.setex(cacheKey, 1800, JSON.stringify(response));

    res.json(response);

  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({ error: 'Failed to fetch forecast data' });
  }
});

// GET /api/weather/marine - Get marine weather conditions
router.get('/marine', optionalAuth, validateCoordinates, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { lat, lon } = req.query;

    // TODO: Get marine data from specialized API
    // For now, return enhanced weather data with marine-specific information
    
    // Mock marine data for development
    const marineData = {
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      marine: {
        waveHeight: 0.5 + Math.random() * 2, // meters
        waveDirection: Math.random() * 360,
        wavePeriod: 4 + Math.random() * 6, // seconds
        seaTemperature: 18 + Math.random() * 8, // Celsius
        tide: {
          current: 'rising', // rising, falling, high, low
          nextHigh: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
          nextLow: new Date(Date.now() + 9 * 3600 * 1000).toISOString(),
          height: 1.2 + Math.random() * 0.8 // meters
        },
        visibility: 8 + Math.random() * 7, // nautical miles
        uvIndex: Math.floor(Math.random() * 11),
        boatConditions: {
          rating: 'good', // excellent, good, fair, poor
          warnings: []
        }
      }
    };

    // Add warnings based on conditions
    if (marineData.marine.waveHeight > 1.5) {
      marineData.marine.boatConditions.warnings.push('High waves - exercise caution');
      marineData.marine.boatConditions.rating = 'fair';
    }
    
    if (marineData.marine.visibility < 5) {
      marineData.marine.boatConditions.warnings.push('Reduced visibility');
      if (marineData.marine.boatConditions.rating === 'good') {
        marineData.marine.boatConditions.rating = 'fair';
      }
    }

    res.json(marineData);

  } catch (error) {
    console.error('Get marine weather error:', error);
    res.status(500).json({ error: 'Failed to fetch marine weather data' });
  }
});

// GET /api/weather/alerts - Get weather alerts for coordinates
router.get('/alerts', optionalAuth, validateCoordinates, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { lat, lon } = req.query;

    // TODO: Get weather alerts from API
    // For now, return mock alerts
    
    const alerts = [
      // Example of how alerts would look
      // {
      //   id: 'alert-123',
      //   title: 'Small Craft Advisory',
      //   description: 'Winds 15-25 knots with occasional gusts up to 30 knots',
      //   severity: 'moderate', // minor, moderate, severe, extreme
      //   urgency: 'expected', // immediate, expected, future
      //   areas: ['Lake Michigan'],
      //   effective: '2024-01-15T12:00:00Z',
      //   expires: '2024-01-16T06:00:00Z',
      //   instruction: 'Small craft should exercise caution'
      // }
    ];

    res.json({
      alerts,
      count: alerts.length
    });

  } catch (error) {
    console.error('Get weather alerts error:', error);
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// GET /api/weather/history - Get historical weather data
router.get('/history', optionalAuth, [
  ...validateCoordinates,
  query('date').isISO8601().withMessage('Invalid date format')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { lat, lon, date } = req.query;
    const targetDate = new Date(date);
    
    // Check if date is too far in the future
    if (targetDate > new Date()) {
      return res.status(400).json({ error: 'Cannot get historical data for future dates' });
    }

    // TODO: Get historical weather data from API
    // This typically requires a premium weather API subscription
    
    // Mock historical data for development
    const historicalData = {
      location: {
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      date: targetDate.toISOString().split('T')[0],
      weather: {
        temperature: 20 + Math.random() * 10,
        humidity: 50 + Math.random() * 40,
        pressure: 1010 + Math.random() * 20,
        wind: {
          speed: 2 + Math.random() * 8,
          direction: Math.random() * 360
        },
        conditions: {
          main: 'Clear',
          description: 'clear sky'
        },
        precipitation: Math.random() * 5
      }
    };

    res.json({ historical: historicalData });

  } catch (error) {
    console.error('Get historical weather error:', error);
    res.status(500).json({ error: 'Failed to fetch historical weather data' });
  }
});

module.exports = router;