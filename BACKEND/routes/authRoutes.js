const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const db = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/signup", async (req, res) => {

  const { name, email, password, role } = req.body;

  try {

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users(name,email,password,role) VALUES(?,?,?,?)";

    db.query(
      sql,
      [name, email, hashedPassword, role],
      (err, result) => {

        if (err) {

          return res.status(500).json({
            message: "Signup Failed",
            error: err,
          });

        }

        const token = jwt.sign(
          {
            id: result.insertId,
            role,
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.json({
          message: "User Registered Successfully",
          token,
          user: {
            id: result.insertId,
            name,
            email,
            role,
          },
        });

      }
    );

  } catch (error) {

    res.status(500).json(error);

  }

});

router.post("/login", (req, res) => {

  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],

    async (err, result) => {

      if (err) {

        return res.status(500).json(err);

      }

      if (result.length === 0) {

        return res.json({
          message: "User Not Found",
        });

      }

      const user = result[0];

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {

        return res.json({
          message: "Invalid Password",
        });

      }

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "1d",
        }
      );

      res.json({
        token,
        user,
      });

    }
  );

});
router.get("/users", authMiddleware, roleMiddleware("admin"), (req, res) => {
  db.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC",
    (err, results) => {
      if (err) {
        return res.status(500).json({ message: "Could not fetch users", error: err });
      }
      res.json(results);
    }
  );
});

router.delete("/users/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
  const userId = Number(req.params.id);

  if (userId === req.user.id) {
    return res.status(400).json({ message: "Cannot delete your own account." });
  }

  db.query("DELETE FROM users WHERE id = ?", [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Could not delete user", error: err });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json({ message: "User deleted successfully." });
  });
});
router.patch("/users/:id", authMiddleware, roleMiddleware("admin"), (req, res) => {
  const userId = Number(req.params.id);
  const { role } = req.body;

  if (!role || !["admin", "member"].includes(role)) {
    return res.status(400).json({ message: "Invalid role." });
  }

  if (userId === req.user.id) {
    return res.status(400).json({ message: "Cannot change your own role." });
  }

  db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "Could not update user role", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: "User role updated successfully." });
  });
});

module.exports = router;