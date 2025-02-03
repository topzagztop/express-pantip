const cloudinary = require("../configs/cloudinary")
const fs = require("fs")
const prisma = require("prisma")

exports.getProfile = (req, res, next) => {
    res.json({ user: req.user });
}

exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName } = req.body;

    const image = req.file
      ? await cloudinary.uploader.upload(req.file.path)
      : null;

    const toUpdateInputs = {
      firstName,
      lastName,
      profileImage: image?.secure_url,
    };

    for (let key in toUpdateInputs) {
      if (!toUpdateInputs[key]) {
        delete toUpdateInputs[key];
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        ...toUpdateInputs,
      },
    });

    res.json({ user: updatedUser });

  } catch (err) {
    next(err);
  } finally {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
  }
};