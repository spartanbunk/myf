const app = require('./app');
const { connectDatabase } = require('./config/database');
const { connectRedis } = require('./config/redis');

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to PostgreSQL
    await connectDatabase();
    console.log('Connected to PostgreSQL database');

    // Connect to Redis
    await connectRedis();
    console.log('Connected to Redis');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await app.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await app.close();
  process.exit(0);
});

startServer();