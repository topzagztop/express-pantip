const express = require("express");
const authenticate = require("../middleware/authenticate");
const upload = require("../middleware/upload");
const userController = require("../controllers/user-contrallers");

const router = express.Router();

router.get("/", authenticate, userController.getProfile);

router.put(
  "/",
  authenticate,
  upload.single("profile"),
  userController.updateProfile
);

module.exports = router;