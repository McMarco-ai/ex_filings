const today = new Date();
today.setHours(0, 0, 0, 0); // Start of today
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

db.projects.aggregate([
  {
    $lookup: {
      from: "tasks",
      localField: "tasks",
      foreignField: "_id",
      as: "taskDetails"
    }
  },
  {
    $match: {
      "taskDetails.due_date": {
        $gte: today,
        $lt: tomorrow
      }
    }
  }
]);
