// Question : Pourquoi créer un module séparé pour les connexions aux bases de données ?
// Réponse : Pour centraliser la gestion des connexions, faciliter la réutilisation et isoler la logique de connexion du reste de l'application.
// Question : Comment gérer proprement la fermeture des connexions ?
// Réponse : Utiliser les promesses et la gestion des erreurs pour gérer proprement la fermeture des connexions, en assurant que toutes les opérations en cours sont terminées avant la fermeture.

const { MongoClient } = require('mongodb');
const redis = require('redis');
const config = require('./env');

let mongoClient, redisClient, db;

async function connectMongo() {
  try {
    mongoClient = new MongoClient(config.mongodb.uri);
    await mongoClient.connect();
    db = mongoClient.db(config.mongodb.dbName);
    console.log('MongoDB connected successfully');
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function connectRedis() {
  try {
    redisClient = redis.createClient({
      url: config.redis.uri
    });
    
    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    await redisClient.connect();
    console.log('Redis connected successfully');
    return redisClient;
  } catch (error) {
    console.error('Redis connection error:', error);
    throw error;
  }
}

async function closeMongo() {
  try {
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
    throw error;
  }
}

async function closeRedis() {
  try {
    if (redisClient) {
      await redisClient.quit();
      console.log('Redis connection closed');
    }
  } catch (error) {
    console.error('Error closing Redis connection:', error);
    throw error;
  }
}

// Export des fonctions et clients
module.exports = {
  connectMongo,
  connectRedis,
  closeMongo,
  closeRedis,
  db: () => db,
  redisClient: () => redisClient
};