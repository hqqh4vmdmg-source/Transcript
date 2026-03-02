require('dotenv').config({ quiet: true });
const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

db.query('SELECT NOW()')
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((_error) => {
    console.warn('Database not reachable at startup. Server is running in degraded mode until database becomes available.');
  });

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
