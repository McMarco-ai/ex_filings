const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const tasksRouter = require('./routes/taskRoute');
const projectRouter = require('./routes/projectRoute');

const app = express();
const port = 3000;

const uri = "mongodb+srv://macm2000364:online@todolist.3qw9x.mongodb.net/todoList?retryWrites=true&w=majority&appName=todoList";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.use(express.json());

async function attachDb(req, res, next) {
  try {
    if (!client.isConnected) {
      await client.connect();
    }
    req.db = client.db('todoList');
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(500).json({ error: 'Failed to connect to the database' });
  }
}

app.use(attachDb);
app.use('/api', tasksRouter);
app.use('/api', projectRouter);


app.get('/', (req, res) => {
  res.send("Welcome to the To-Do List API!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});
