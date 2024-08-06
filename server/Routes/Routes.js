// routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authenticateToken = require('../middleware/authMiddleware');

// Define routes
router.post('/projects/:projectId/tasks', authenticateToken, taskController.createTask);
router.get('/projects/:projectId/tasks', authenticateToken, taskController.getTask);
router.put('/projects/:projectId/tasks/:taskId/move', authenticateToken, taskController.moveTask);
router.delete('/projects/:projectId/tasks/:taskId', authenticateToken, taskController.deleteTask);
router.put('/projects/:projectId/tasks/:taskId', authenticateToken, taskController.updateTask);

module.exports = router;
