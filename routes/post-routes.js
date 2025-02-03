const express = require("express");
const authenticate = require("../middleware/authenticate");
const postControllers = require("../controllers/post-controllers")
const router = express.Router();

// Post
router.get("/list/:category", postControllers.getPostList)

router.get("/:id", postControllers.getPost);

router.post("/", authenticate, postControllers.createPost);

router.put("/:id", authenticate, postControllers.updatePost);

router.delete("/:id", authenticate, postControllers.deletePost);

// Comment
router.post("/:id/comment", authenticate, postControllers.commentPost);

router.put("/comment/:commentId", authenticate, postControllers.updateComment);

router.delete(
  "/comment/:commentId",
  authenticate,
  postControllers.deleteComment
);

module.exports = router;
