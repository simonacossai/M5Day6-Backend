const express = require("express")
const cors = require("cors")
const { join } = require("path")
const listEndpoints = require("express-list-endpoints")
const productsRouter = require("./products")
const reviewsRouter = require("./reviews")
const usersRouter = require("./users")
const problematicRoutes = require("./problematicRoutes")
const productsRoute = require("./products");
const {
  badRequestHandler,
  notFoundHandler,
  genericErrorHandler,
} = require("./errorHandling")


const publicFolderPath = join(__dirname, "../public");
const server = express()
server.use(express.static(publicFolderPath));

const port =process.env.PORT || 3001

server.use(cors())
server.use(express.json()) 
server.use("/products", productsRoute);
server.use("/reviews", reviewsRouter)
server.use("/users", usersRouter)

server.use(badRequestHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)


console.log(listEndpoints(server))

server.listen(port, () => {
  console.log("Server is running on port: ", port)
})