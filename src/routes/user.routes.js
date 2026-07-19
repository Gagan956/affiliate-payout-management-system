const express = require("express");
const router = express.Router();
const {
  createUser,
  getUser,
  getAllUsers,
} = require("../controllers/user.controller");

// routers
router.post("/users", createUser);

router.get("/users", getAllUsers);

router.get("/users/search", getUser);

module.exports = router;
