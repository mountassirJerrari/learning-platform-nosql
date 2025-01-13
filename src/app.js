// Question: Comment organiser le point d'entrée de l'application ?
// Question: Quelle est la meilleure façon de gérer le démarrage de l'application ?

const express = require('express');
const config = require('./config/env');
const {connectMongo, connectRedis, closeMongo, closeRedis} = require('./config/db');

const courseRoutes = require('./routes/courseRoutes');
//const studentRoutes = require('./routes/studentRoutes');

const app = express();

async function startServer() {
  try {
    // Initialiser les connexions aux bases de données
    await connectMongo();
    await connectRedis();
    
    // Configurer les middlewares Express
    app.use(express.json());  
    
    // Monter les routes
    app.use('/course', courseRoutes);
    
    // Démarrer le serveur
    app.listen(config.port, () => {
      console.log(`Server started on port ${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Starting graceful shutdown...');
  try {
    await closeRedis();
    await closeMongo();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();