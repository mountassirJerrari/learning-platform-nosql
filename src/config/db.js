// Question : Pourquoi créer un module séparé pour les connexions aux bases de données ?
// Réponse : Pour centraliser la gestion des connexions, faciliter la réutilisation et isoler la logique de connexion du reste de l'application.
// Question : Comment gérer proprement la fermeture des connexions ?
// Réponse : Utiliser les promesses et la gestion des erreurs pour gérer proprement la fermeture des connexions, en assurant que toutes les opérations en cours sont terminées avant la fermeture.

const { MongoClient } = require('mongodb');
const redis = require('redis');
const config = require('./env');

let mongoClient, redisClient, db;

async function connectMongo() {
  // TODO: Implémenter la connexion MongoDB       
  // Gérer les erreurs et les retries
  try {
    mongoClient = new MongoClient(config.MONGODB_URI);
    await mongoClient.connect();
    db = mongoClient.db(config.MONGODB_DB_NAME);
    console.log('MongoDB connected successfully');
    return db;
} catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
}
}

async function connectRedis() {
  // TODO: Implémenter la connexion Redis
  // Gérer les erreurs et les retries

  try {
    redisClient = redis.createClient({
        url: config.REDIS_URI
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

// Export des fonctions et clients
module.exports = {
  // TODO: Exporter les clients et fonctions utiles
  connectMongo,
    connectRedis,
    db,
    redisClient
};