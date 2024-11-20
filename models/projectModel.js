const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Project name is required
  },
  description: {
    type: String,
    required: false, // Optional project description
  },
  start_date: {
    type: Date,
    required: true, // Start date is required
  },
  due_date: {
    type: Date,
    required: true, // Due date is required
  },
  tasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task', // References Task model
  }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } // Automatically add created_at and updated_at fields
});

// Compile model from schema
const Project = mongoose.model('Project', ProjectSchema);

// Export the model
module.exports = Project;
