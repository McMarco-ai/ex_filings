const express = require('express');
const router = express.Router();

// ==========================
// Create a new project
// ==========================
router.post('/projects', async (req, res) => {
  try {
    const { name, description, start_date, due_date } = req.body;
    const newProject = {
      name, // Project name
      description, // Optional description
      start_date: new Date(start_date), // Start date, converted to a Date object
      due_date: new Date(due_date), // Due date, converted to a Date object
      tasks: [] // Empty array for tasks (to be added later)
    };
    const result = await req.db.collection('projects').insertOne(newProject); // Insert the new project into the database
    res.status(201).json({ status: "success", message: "Project created.", data: result.ops[0] }); // Respond with success and the created project
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// List all projects
// ==========================
router.get('/projects', async (req, res) => {
  try {
    const projects = await req.db.collection('projects').find().toArray(); // Fetch all projects
    res.status(200).json({ status: "success", data: projects }); // Respond with the list of projects
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Edit a project
// ==========================
router.put('/projects/:id', async (req, res) => {
  const { id } = req.params; // Get the project ID from the route parameter
  const updates = req.body; // Get the update data from the request body

  try {
    const result = await req.db.collection('projects').findOneAndUpdate(
      { _id: new req.db.bson.ObjectId(id) }, // Find the project by ID
      { $set: updates }, // Apply the updates
      { returnDocument: 'after' } // Return the updated document
    );
    if (!result.value) {
      res.status(404).json({ status: "not_found", message: "Project not found." }); // Respond if the project was not found
      return;
    }
    res.status(200).json({ status: "success", message: "Project updated.", data: result.value }); // Respond with the updated project
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Delete a project
// ==========================
router.delete('/projects/:id', async (req, res) => {
  const { id } = req.params; // Get the project ID from the route parameter

  try {
    const result = await req.db.collection('projects').deleteOne({ _id: new req.db.bson.ObjectId(id) }); // Delete the project by ID
    if (result.deletedCount === 0) {
      res.status(404).json({ status: "not_found", message: "Project not found." }); // Respond if the project was not found
      return;
    }
    res.status(200).json({ status: "success", message: "Project deleted." }); // Respond with success if deletion was successful
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Assign a task to a project
// ==========================
router.post('/projects/:projectId/tasks/:taskId', async (req, res) => {
  const { projectId, taskId } = req.params; // Get the project and task IDs from the route parameters

  try {
    const result = await req.db.collection('projects').findOneAndUpdate(
      { _id: new req.db.bson.ObjectId(projectId) }, // Find the project by ID
      { $addToSet: { tasks: new req.db.bson.ObjectId(taskId) } }, // Add the task ID to the project's tasks array (avoiding duplicates)
      { returnDocument: 'after' } // Return the updated document
    );
    if (!result.value) {
      res.status(404).json({ status: "not_found", message: "Project not found." }); // Respond if the project was not found
      return;
    }
    res.status(200).json({ status: "success", message: "Task assigned to project.", data: result.value }); // Respond with success and the updated project
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Filter tasks by project name
// ==========================
router.get('/tasks/filter/project', async (req, res) => {
  const { projectName } = req.query; // Get the project name from query parameters

  try {
    const project = await req.db.collection('projects').findOne({ name: { $regex: projectName, $options: 'i' } }); // Find the project by name (case-insensitive)
    if (!project) {
      res.status(404).json({ status: "not_found", message: "Project not found." }); // Respond if the project was not found
      return;
    }
    const tasks = await req.db.collection('tasks').find({ _id: { $in: project.tasks } }).toArray(); // Fetch tasks belonging to the project
    res.status(200).json({ status: "success", data: tasks }); // Respond with the tasks
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Sort projects by dates
// ==========================
router.get('/projects/sort', async (req, res) => {
  const { sortBy } = req.query; // Get the sort field from query parameters
  const validSortFields = ['start_date', 'due_date']; // Define valid sort fields

  if (!validSortFields.includes(sortBy)) {
    res.status(400).json({ status: "error", message: "Invalid sort field." }); // Respond if the sort field is invalid
    return;
  }

  try {
    const projects = await req.db.collection('projects').find().sort({ [sortBy]: 1 }).toArray(); // Sort projects by the specified field in ascending order
    res.status(200).json({ status: "success", data: projects }); // Respond with the sorted projects
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

module.exports = router;
