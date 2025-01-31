const createError = require("../utils/createError");
const prisma = require("../configs/prisma");

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
  
  const post = await prisma.post.findFirst({
    where: {
      id: Number(id),
    },
    include: {
      tags: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      comments:true,
    },
  });

  res.json({ post });
};

exports.createPost = async (req, res, next) => {

  try {
    const { title, content, category, userId, tags } = req.body;

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
            id: userId,
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

exports.updatePost = (req, res, next) => {
  res.json({ message: "Update post" });
};

exports.deletePost = (req, res, next) => {
  res.json({ message: "Delet post" });
};
