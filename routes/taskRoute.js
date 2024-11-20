const express = require('express');
const router = express.Router();

// ==========================
// Create a new task
// ==========================
router.post('/tasks', async (req, res) => {
  try {
    const { name, start_date, due_date } = req.body;
    const newTask = {
      name, // Task name
      start_date: new Date(start_date), // Start date, converted to a Date object
      due_date: new Date(due_date), // Due date, converted to a Date object
      isDone: false, // Default status of the task is "not done"
    };
    const result = await req.db.collection('tasks').insertOne(newTask); // Insert the new task into the database
    res.status(201).json({ status: "success", message: "Task created.", data: result.ops[0] }); // Respond with the created task
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// List all tasks
// ==========================
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await req.db.collection('tasks').find().toArray(); // Fetch all tasks from the database
    res.status(200).json({ status: "success", data: tasks }); // Respond with the list of tasks
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Edit a task
// ==========================
router.put('/tasks/:id', async (req, res) => {
  const { id } = req.params; // Get the task ID from the route parameter
  const updates = req.body; // Get the update data from the request body

  try {
    const result = await req.db.collection('tasks').findOneAndUpdate(
      { _id: new req.db.bson.ObjectId(id) }, // Find the task by ID
      { $set: updates }, // Apply the updates
      { returnDocument: 'after' } // Return the updated document
    );
    if (!result.value) {
      res.status(404).json({ status: "not_found", message: "Task not found." }); // Respond if the task was not found
      return;
    }
    res.status(200).json({ status: "success", message: "Task updated.", data: result.value }); // Respond with the updated task
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Delete a task
// ==========================
router.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params; // Get the task ID from the route parameter

  try {
    const result = await req.db.collection('tasks').deleteOne({ _id: new req.db.bson.ObjectId(id) }); // Delete the task by ID
    if (result.deletedCount === 0) {
      res.status(404).json({ status: "not_found", message: "Task not found." }); // Respond if the task was not found
      return;
    }
    res.status(200).json({ status: "success", message: "Task deleted." }); // Respond with success if deletion was successful
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Update task status
// ==========================
router.patch('/tasks/:id/status', async (req, res) => {
  const { id } = req.params; // Get the task ID from the route parameter
  const { isDone } = req.body; // Get the new status from the request body

  try {
    const updateFields = { isDone }; // Initialize the update fields

    if (isDone === false) {
      // If the task is reset to "not done," clear related date fields
      updateFields.start_date = null;
      updateFields.done_date = null;
    }

    const result = await req.db.collection('tasks').findOneAndUpdate(
      { _id: new req.db.bson.ObjectId(id) }, // Find the task by ID
      { $set: updateFields }, // Apply the status update
      { returnDocument: 'after' } // Return the updated document
    );

    if (!result.value) {
      res.status(404).json({ status: "not_found", message: "Task not found." }); // Respond if the task was not found
      return;
    }

    res.status(200).json({
      status: "success",
      message: isDone ? "Task marked as done." : "Task reset to 'to-do'.", // Success message based on the new status
      data: result.value
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Filter tasks by status
// ==========================
router.get('/tasks/filter/status', async (req, res) => {
  const { isDone } = req.query; // Get the status from query parameters

  try {
    const tasks = await req.db.collection('tasks').find({ isDone: isDone === 'true' }).toArray(); // Fetch tasks based on the status
    res.status(200).json({ status: "success", data: tasks }); // Respond with the filtered tasks
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Search tasks by name
// ==========================
router.get('/tasks/search', async (req, res) => {
  const { name } = req.query; // Get the task name from query parameters

  try {
    const tasks = await req.db.collection('tasks').find({ name: { $regex: name, $options: 'i' } }).toArray(); // Find tasks with names matching the search string
    res.status(200).json({ status: "success", data: tasks }); // Respond with the matched tasks
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

// ==========================
// Sort tasks by specific fields
// ==========================
router.get('/tasks/sort', async (req, res) => {
  const { sortBy } = req.query; // Get the sort field from query parameters
  const validSortFields = ['start_date', 'due_date', 'done_date']; // Define valid sort fields

  if (!validSortFields.includes(sortBy)) {
    res.status(400).json({ status: "error", message: "Invalid sort field." }); // Respond if the sort field is invalid
    return;
  }

  try {
    const tasks = await req.db.collection('tasks').find().sort({ [sortBy]: 1 }).toArray(); // Sort tasks by the specified field in ascending order
    res.status(200).json({ status: "success", data: tasks }); // Respond with the sorted tasks
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message }); // Handle server errors
  }
});

module.exports = router;
