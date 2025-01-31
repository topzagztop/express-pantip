const cloudinary = require("../configs/cloudinary")
const fs = require("fs")

exports.getProfile = (req, res, next) => {
    res.json({ message: "Get my user profile" });
}

exports.updateProfile = async (req, res, next) => {
    try {
        const image = await cloudinary.uploader.upload(req.file.path);
        console.log(image);
    
        res.json({ message: "My profile updated" });
      } catch (err) {
        console.log(err);
        next(err)
      } finally {
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
      }
}