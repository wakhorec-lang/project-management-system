const express = require("express");

const router = express.Router();

const db = require("../config/db");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
  "/create",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    const {
      title,
      description,
      deadline,
      assigned_to,
      project_id,
      priority
    } = req.body;

    if (!title || !project_id) {
      return res.status(400).json({ message: "Title and project are required." });
    }

    const sql =
      `INSERT INTO tasks
      (title,description,deadline,assigned_to,project_id,priority)
      VALUES(?,?,?,?,?,?)`;

    db.query(
      sql,
      [title, description, deadline, assigned_to || null, project_id, priority || "medium"],
      (err) => {
        if (err) {
          return res.status(500).json({ message: "Could not create task", error: err });
        }

        res.json({ message: "Task Created Successfully" });
      }
    );
  }
);

router.get("/", authMiddleware, (req, res) => {
  const queryParams = [];
  let sql = `
    SELECT
      t.id,
      t.title,
      t.description,
      t.deadline,
      t.priority,
      t.status,
      t.created_at,
      t.project_id,
      p.title AS project_title,
      t.assigned_to,
      u.name AS assignee_name
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    LEFT JOIN users u ON t.assigned_to = u.id
  `;

  if (req.user.role !== "admin") {
    sql += " WHERE t.assigned_to = ?";
    queryParams.push(req.user.id);
  }

  db.query(sql, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Could not fetch tasks", error: err });
    }
    res.json(results);
  });
});

router.patch("/:id/status", authMiddleware, (req, res) => {
  const { status } = req.body;
  const taskId = req.params.id;
  const allowedStatuses = ["pending", "in progress", "completed"];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  db.query("SELECT assigned_to FROM tasks WHERE id = ?", [taskId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Could not verify task", error: err });
    }

    if (!results.length) {
      return res.status(404).json({ message: "Task not found." });
    }

    const task = results[0];
    if (req.user.role !== "admin" && task.assigned_to !== req.user.id) {
      return res.status(403).json({ message: "You do not have permission to update this task." });
    }

    db.query("UPDATE tasks SET status = ? WHERE id = ?", [status, taskId], (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: "Could not update task status", error: updateErr });
      }
      res.json({ message: "Task status updated successfully." });
    });
  });
});

router.get("/projects", authMiddleware, roleMiddleware("admin"), (req, res) => {
  db.query("SELECT id, title FROM projects ORDER BY title", (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Could not fetch projects", error: err });
    }
    res.json(results);
  });
});

router.get("/members", authMiddleware, roleMiddleware("admin"), (req, res) => {
  db.query(
    "SELECT id, name, email FROM users WHERE role = 'member' ORDER BY name",
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Could not fetch members", error: err });
      }
      res.json(results);
    }
  );
});

router.patch("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
  const taskId = req.params.id;
  const { title, description, deadline, assigned_to, project_id, priority } = req.body;

  if (!title || !project_id) {
    return res.status(400).json({ message: "Title and project are required." });
  }

  db.query(
    "UPDATE tasks SET title = ?, description = ?, deadline = ?, assigned_to = ?, project_id = ?, priority = ? WHERE id = ?",
    [title, description || null, deadline || null, assigned_to || null, project_id, priority || "medium", taskId],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Could not update task", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Task not found." });
      }
      res.json({ message: "Task updated successfully." });
    }
  );
});

router.delete("/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
  const taskId = req.params.id;

  db.query("DELETE FROM tasks WHERE id = ?", [taskId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Could not delete task", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json({ message: "Task deleted successfully." });
  });
});

module.exports = router;