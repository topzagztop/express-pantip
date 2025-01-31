require('dotenv').config()

const express = require("express");
const cors = require("cors")
const errorHandler = require("./middleware/error")
const notFoundHandler = require("./middleware/not-found")

const postRoute = require("./routes/post-routes")
const userRoute = require("./routes/user-routes")
const authRoute = require("./routes/auth-routes")

const app = express();

app.use(cors())
app.use(express.json())

app.use("/post", postRoute)
app.use("/user", userRoute)
app.use("/auth", authRoute)

app.use(errorHandler)
app.use(notFoundHandler)


app.listen("8000", () => console.log("Server is running on port 8000"));