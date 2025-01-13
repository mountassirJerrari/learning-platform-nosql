// Question: Pourquoi créer des services séparés ?
// Réponse: Pour centraliser la gestion des connexions aux bases de données, faciliter la réutilisation et isoler la logique de connexion du reste de l'application.

const { ObjectId } = require('mongodb');

// Fonctions utilitaires pour MongoDB
async function findOneById(collection, id) {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const objectId = new ObjectId(id);
    return await collection.findOne({ _id: objectId });
  } catch (error) {
    console.error('Error in findOneById:', error);
    throw error;
  }
}

async function findMany(collection, query = {}, options = {}) {
  try {
    return await collection.find(query, options).toArray();
  } catch (error) {
    console.error('Error in findMany:', error);
    throw error;
  }
}

async function insertOne(collection, document) {
  try {
    const result = await collection.insertOne(document);
    return result;
  } catch (error) {
    console.error('Error in insertOne:', error);
    throw error;
  }
}

async function updateOne(collection, id, update) {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const objectId = new ObjectId(id);
    const result = await collection.updateOne(
      { _id: objectId },
      { $set: update }
    );
    return result;
  } catch (error) {
    console.error('Error in updateOne:', error);
    throw error;
  }
}

async function deleteOne(collection, id) {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const objectId = new ObjectId(id);
    const result = await collection.deleteOne({ _id: objectId });
    return result;
  } catch (error) {
    console.error('Error in deleteOne:', error);
    throw error;
  }
}

// Export des services
module.exports = {
  findOneById,
  findMany,
  insertOne,
  updateOne,
  deleteOne
};