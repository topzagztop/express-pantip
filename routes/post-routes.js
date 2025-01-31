const express = require("express");
const authenticate = require("../middleware/authenticate");
const postControllers = require("../controllers/post-controllers")
const router = express.Router();

router.get("/list/:category", postControllers.getPostList)

router.get("/:id", postControllers.getPost);

router.post("/", authenticate, postControllers.createPost);

router.put("/", authenticate, postControllers.updatePost);

router.delete("/", authenticate, postControllers.deletePost);

module.exports = router;
