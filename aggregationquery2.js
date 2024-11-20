db.tasks.aggregate([
    {
      $lookup: {
        from: "projects",
        localField: "_id",
        foreignField: "tasks",
        as: "projectDetails"
      }
    },
    {
      $match: {
        "projectDetails.due_date": {
          $gte: today,
          $lt: tomorrow
        }
      }
    }
  ]);
  