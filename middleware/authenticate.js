const createError = require("../utils/createError")
const jwt = require("jsonwebtoken")
const prisma = require("../configs/prisma")

const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization || !authorization.startsWith("Bearer")) {
      return createError(401, "Unauthorized");
    }

    const token = authorization.split(" ")[1]

    if(!token) {
        return createError(401, "Unauthorized")
    }

    const jwtPayload = jwt.verify(token, process.env.SECRET_KEY);

    const user = await prisma.user.findFirst({
      where: {
        id: jwtPayload.id,
      },
    });

    if (!user) {
      return createError(400, "User not found");
    }

    delete user.password

    req.user = user;

    next();

  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;