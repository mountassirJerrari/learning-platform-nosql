// Question: Quelle est la différence entre un contrôleur et une route ?
// Réponse: Le contrôleur contient la logique métier tandis que la route définit les points d'entrée de l'API.
// Question : Pourquoi séparer la logique métier des routes ?
// Réponse : Pour une meilleure maintenance et réutilisation du code.

const { ObjectId } = require('mongodb');
const { db } = require('../config/db');
const mongoService = require('../services/mongoService');
const redisService = require('../services/redisService');

async function createCourse(req, res) {
  try {
    const courseData = req.body;
    const collection = db().collection('courses');
    
    // Validate required fields
    if (!courseData.title || !courseData.description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    // Add timestamps
    const courseWithTimestamps = {
      ...courseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(courseWithTimestamps);
    
    // Use mongoService to insert
    const result = await mongoService.insertOne(collection, courseWithTimestamps);
    
    // Cache the new course
    const courseId = result.insertedId.toString();
    await redisService.cacheData(`course:${courseId}`, courseWithTimestamps);

    res.status(201).json({ ...courseWithTimestamps, _id: courseId });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getAllCourses(req, res) {
  try {
    // Try to get from cache first
    const cachedCourses = await redisService.getCachedData('courses:all');
    if (cachedCourses) {
      return res.json(cachedCourses);
    }

    // If not in cache, get from database
    const collection = db().collection('courses');
    const courses = await mongoService.findMany(collection);
    
    // Cache the courses for future requests (1 hour)
    await redisService.cacheData('courses:all', courses, 3600);
    
    res.json(courses);
  } catch (error) {
    console.error('Error getting all courses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCourse(req, res) {
  try {
    const { id } = req.params;
    
    // Try to get from cache first
    const cachedCourse = await redisService.getCachedData(`course:${id}`);
    if (cachedCourse) {
      return res.json(cachedCourse);
    }

    // If not in cache, get from database using mongoService
    const collection = db().collection('courses');
    const course = await mongoService.findOneById(collection, id);
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Cache the course for future requests
    await redisService.cacheData(`course:${id}`, course);
    
    res.json(course);
  } catch (error) {
    console.error('Error getting course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function updateCourse(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const collection = db().collection('courses');

    // Add updated timestamp
    updates.updatedAt = new Date();

    // Use mongoService to update
    const result = await mongoService.updateOne(collection, id, updates);
    
    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Invalidate caches
    await redisService.invalidateCache(`course:${id}`);
    await redisService.invalidateCache('courses:all');
    
    // Get updated course
    const updatedCourse = await mongoService.findOneById(collection, id);
    res.json(updatedCourse);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function deleteCourse(req, res) {
  try {
    const { id } = req.params;
    const collection = db().collection('courses');

    // Use mongoService to delete
    const result = await mongoService.deleteOne(collection, id);
    
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Invalidate caches
    await redisService.invalidateCache(`course:${id}`);
    await redisService.invalidateCache('courses:all');
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Export des contrôleurs
module.exports = {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse
};