const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  due_date: {
    type: Date,
    required: true,
  },
  done_date: {
    type: Date,
    required: false, // Not all tasks may be done initially
  },
  isDone: {
    type: Boolean,
    default: false, // Default to false as tasks start as not completed
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Automatically add created_at and updated_at fields
});

// Compile model from schema
const Task = mongoose.model('Task', TaskSchema);

// Export the model
module.exports = Task;
