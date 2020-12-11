const express = require("express")
const cors = require("cors")
const { join } = require("path")
const listEndpoints = require("express-list-endpoints")
const productsRouter = require("./products")
const reviewsRouter = require("./reviews")
const problematicRoutes = require("./problematicRoutes")


const publicFolderPath = join(__dirname, "../public");
const server = express()
server.use(express.static(publicFolderPath));

const port =process.env.PORT || 3001

server.use(cors())
server.use(express.json()) 

server.use("/reviews", reviewsRouter)


console.log(listEndpoints(server))

server.listen(port, () => {
  console.log("Server is running on port: ", port)
})