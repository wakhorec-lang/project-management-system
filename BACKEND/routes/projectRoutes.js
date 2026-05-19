const express = require("express");

const router = express.Router();

const db = require("../config/db");

const authMiddleware =
require("../middleware/authMiddleware");

const roleMiddleware =
require("../middleware/roleMiddleware");

router.post(
  "/create",

  authMiddleware,

  roleMiddleware("admin"),

  (req, res) => {

    const {
      title,
      description,
      deadline
    } = req.body;

    const sql =
    "INSERT INTO projects(title,description,deadline,created_by) VALUES(?,?,?,?)";

    db.query(
      sql,
      [
        title,
        description,
        deadline,
        req.user.id
      ],

      (err, result) => {

        if (err) {

          return res.status(500).json(err);

        }

        res.json({
          message: "Project Created Successfully"
        });

      }
    );

  }
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    db.query(
      "SELECT id, title, description, deadline, created_at FROM projects ORDER BY created_at DESC",
      (err, results) => {
        if (err) {
          return res.status(500).json({ message: "Could not fetch projects", error: err });
        }
        res.json(results);
      }
    );
  }
);

router.patch(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    const projectId = req.params.id;
    const { title, description, deadline } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required." });
    }

    db.query(
      "UPDATE projects SET title = ?, description = ?, deadline = ? WHERE id = ?",
      [title, description || null, deadline || null, projectId],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Could not update project", error: err });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: "Project not found." });
        }
        res.json({ message: "Project updated successfully." });
      }
    );
  }
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    const projectId = req.params.id;

    db.query("DELETE FROM projects WHERE id = ?", [projectId], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Could not delete project", error: err });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Project not found." });
      }
      res.json({ message: "Project deleted successfully." });
    });
  }
);

module.exports = router;