module.exports = app => {

    const authRouter = require("./auth.routes")
    app.use("/api", authRouter)

    const communityRouter = require("./community.routes")
    app.use("/api", communityRouter)

    const reviewRouter = require("./review.routes")
    app.use("/api", reviewRouter)

    const tmdbRouter = require("./tmdb.routes")
    app.use("/api", tmdbRouter)

    const userRouter = require("./user.routes")
    app.use("/api", userRouter)

    const uploadRouter = require("./upload.routes")
    app.use("/api/upload", uploadRouter)
}