const createError = require("../utils/createError");
const prisma = require("../configs/prisma");
const postService = require("../services/post-services");
const { connect } = require("../routes/post-routes");

exports.getPostList = async (req, res, next) => {
  const { category } = req.params;
  const { page = "1", limit = "25" } = req.query;
  
  if(!category) {
    return createError(400, "Category to be provided")
  }

  if(isNaN(Number(page)) || isNaN(Number(limit))) {
    return createError(400, "Invalid type for page of limit")
  }

  const skip = (Number(page) - 1) * Number(limit)

  const posts = await prisma.post.findMany({
    where: {
      category: {
        name: category,
      },
    },
    include: {
      tags: true,
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: skip,
    take: Number(limit),
  });

  res.status(200).json({ posts });
};

exports.getPost = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return createError(400, "Post id to be provided");
  }
  if (isNaN(Number(id))) {
    return createError(400, "Invalid id");
  }
  
  const post = await postService.getPostbyId(id)

  res.json({ post });
};

exports.createPost = async (req, res, next) => {

  try {
    const { title, content, category, tags } = req.body;

    if (!title) {
      return createError(400, "Title to be provided");
    }

    if (!content) {
      return createError(400, "Content to be provided");
    }

    if (typeof title !== "string" || typeof content !== "string") {
      return createError(400, "Invalid title or content type");
    }

    if (!category) {
      return createError(400, "Category to be provided");
    }

    if (typeof category !== "string") {
      return createError(400, "Category should be string");
    }

    if (!Array.isArray(tags)) {
      return createError(400, "Tags should be array");
    }

    for (let el of tags) {
      if (typeof el !== "string") {
        return createError(400, "Tag should be string");
      }
    }

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        user: {
          connect: {
            id: req.user.id,
          },
        },
        category: {
          connect: {
            name: category,
          },
        },
        tags: {
          connectOrCreate: tags.map((el) => ({
            where: { name: el.toLowerCase() },
            create: { name: el.toLowerCase() },
          })),
        },
      },
      include: {
        category: true,
        tags: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json({
      post: newPost,
      message: "Create post",
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const { id } = req.params;
  const { title, content, tags } = req.body;

  // check easy to hard
  if(!id) {
    return createError(400, "Id to be provideds")
  }

  if(!title) {
    return createError(400, "Title to be provideds");
  }

  if(!content) {
    return createError(400, "Content to be provideds");
  }

  if (
    typeof title !== "string" ||
    typeof content !== "string"
  ) {
    return createError(400, "Invalid typeof title, content");
  }

  if (!Array.isArray(tags)) {
    return createError(400, "Tags should be arrays");
  }

  for (let el of tags) {
    if (typeof el !== "string") {
      return createError(400, "Invalid typeof tags");
    }
  }

  const post = await postService.getPostbyId(id)

  if (!post) {
    return createError(400, "Post not found");
  }

  if (post.userId !== req.user.id) {
    return createError(403, "Forbidden");
  }

  // Update Tags

  // const tagProsmiseArray = tags.map((el) => {
  //   return prisma.tag.findFirst({
  //     where: {
  //       name: el,
  //     },
  //   });
  // });

  // const tagArray = await Promise.all(tagProsmiseArray);

  // const toCreateTags = tags.filter(
  //   (tag) => !tagArray.find((el) => el?.name === tag)
  // );

  // await prisma.tag.createMany({
  //   data: toCreateTags.map((el) => ({ name: el })), // [{name: "ของเล่น"}, {name: "ของเล่น"}]
  // });

  const updatedPost = await prisma.post.update({
    where: {
      id: post.id,
    },
    data: {
      title,
      content,
      tags: {
        // connect: tags.map((el) => ({ name: el })),
        connectOrCreate: tags.map((el) => ({
          where: { name: el },
          create: { name: el },
        })),
      },
    },
    include: {
      tags: true,
    },
  });

  res.json({ post: updatedPost });
};

exports.deletePost = async (req, res, next) => {
  const { id } = req.params;

  if(!id) {
    return createError("Id to be provided")
  }
  const post = await postService.getPostbyId(id);

  if (req.user.id !== post.userId) {
    return createError("User to be provided")
  }

  await prisma.post.delete({
    where: {
      id: post.id,
    },
  });

  res.json({ message: "Delete post" });
};

exports.commentPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!id) {
      return createError(400, "Post id to be provided");
    }

    if (!content) {
      return createError(400, "Content to be provided");
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        post: {
          connect: {
            id: Number(id),
          },
        },
        user: {
          connect: {
            id: req.user.id,
          },
        },
      },
    });

    res.json({ comment });
  } catch (err) {
    next(err);
  }
};

exports.updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!commentId) {
      return createError(400, "Id to be provided")
    }

    if (!content) {
      return createError(400, "Content to be provided");
    }

    const comment = await prisma.comment.update({
      where: {
        id: Number(commentId),
        userId: req.user.id,
      },
      data: {
        content,
      },
    });

    res.json({comment})

  } catch (err) {
    next(err)
  }
}

exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    if (!commentId) {
      return createError(400, "Comment id to be provided")
    }

    const comment = await prisma.comment.findFirst({
      where: {
        id: Number(commentId),
      },
    });

    if (comment.userId !== req.user.id) {
      return createError(403, "Forbidden")
    }

    await prisma.comment.delete({
      where: {
        id: Number(commentId),
      },
    });

    res.status(204).json({ message: "Delete Comment" });
  } catch (err) {
    next(err)
  }
}
