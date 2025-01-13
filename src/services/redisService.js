// Question : Comment gérer efficacement le cache avec Redis ?
// Réponse :  pour gerer efficacement le cache avec redis, il est important de choisir les bonnes clés pour chaque type de données que l'on veut stocker.
// Question: Quelles sont les bonnes pratiques pour les clés Redis ?
// Réponse : les clés doivent avoir une structure claire et coherente 

const { redisClient } = require('../config/db');

// Fonctions utilitaires pour Redis
async function cacheData(key, data, ttl = 3600) {
  try {
    const serializedData = JSON.stringify(data);
    await redisClient().setEx(key, ttl, serializedData);
    return true;
  } catch (error) {
    console.error('Error caching data:', error);
    throw error;
  }
}

async function getCachedData(key) {
  try {
    const data = await redisClient().get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cached data:', error);
    throw error;
  }
}

async function invalidateCache(key) {
  try {
    await redisClient().del(key);
    return true;
  } catch (error) {
    console.error('Error invalidating cache:', error);
    throw error;
  }
}

async function invalidatePattern(pattern) {
  try {
    const keys = await redisClient().keys(pattern);
    if (keys.length > 0) {
      await redisClient().del(keys);
    }
    return true;
  } catch (error) {
    console.error('Error invalidating cache pattern:', error);
    throw error;
  }
}

async function setHash(key, data) {
  try {
    await redisClient().hSet(key, data);
    return true;
  } catch (error) {
    console.error('Error setting hash:', error);
    throw error;
  }
}

async function getHash(key) {
  try {
    return await redisClient().hGetAll(key);
  } catch (error) {
    console.error('Error getting hash:', error);
    throw error;
  }
}

module.exports = {
  cacheData,
  getCachedData,
  invalidateCache,
  invalidatePattern,
  setHash,
  getHash
};