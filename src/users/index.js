const express = require("express")
const { check, validationResult } = require("express-validator")
const uniqid = require("uniqid")
const { getUsers, writeUsers } = require("../lib/utilities")

const usersRouter = express.Router()


usersRouter.get("/", async (req, res, next) => {
  try {
    const users = await getUsers()
      res.send(users)
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.get("/:userId", async (req, res, next) => {
  try {
    const users = await getUsers()

    const userFound =  users.find(
      user => user._id === req.params.userId
    )

    if (userFound) {
      res.send(userFound)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.post("/", async (req, res, next) => {
  try {
      const users = await getUsers()
      users.push({
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: uniqid(),
        products: [],
      })
      await writeUsers(users)
      res.status(201).send(users)
    }catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.put(
  "/:userId",
  async (req, res, next) => {
    try {
        const users = await getUsers()

        const userIndex = users.findIndex(
          user=> user._id === req.params.userId
        )

        if (userIndex !== -1) {
          // product found
          const updatedUsers = [
            ...users.slice(0, userIndex),
            { ...users[userIndex], ...req.body },
            ...users.slice(userIndex + 1),
          ]
          await writeUsers(updatedUsers)
          res.send(updatedUsers)
        } else {
          const err = new Error()
          err.httpStatusCode = 404
          next(err)
        }
      }catch (error) {
      console.log(error)
      next(error)
    }
  }
)

usersRouter.delete("/:userId", async (req, res, next) => {
  try {
    const users = await getUsers()

    const userFound = users.find(
      user => user._id === req.params.userId
    )

    if (userFound) {
      const filteredUsers = users.filter(
        user => user._id !== req.params.userId
      )

      await writeUsers(filteredUsers)
      res.status(204).send()
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.get("/:userId/products", async (req, res, next) => {
  try {
    const users = await getUsers()

    const userFound = users.find(
      user => user._id === req.params.userId
    )

    if (userFound) {
      res.send(userFound.products)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.get("/:userId/products/:productId", async (req, res, next) => {
  try {
    const users = await getUsers()

    const userFound = users.find(
      user => user._id === req.params.userId
    )

    if (userFound) {
      const productFound =  userFound.products.find(
        product => product._id === req.params.productId
      )
      if (productFound) {
        res.send(productFound)
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next(error)
  }
})

usersRouter.post(
  "/:userId/products",
  async (req, res, next) => {
    try {
      const users = await getUsers()

      const userIndex = users.findIndex(
        user => user._id === req.params.userId
      )
      if (userIndex !== -1) {
        // product found
        users[userIndex].products.push({
          ...req.body,
          _id: uniqid(),
          createdAt: new Date(),
        })
        await writeUsers(users)
        res.status(201).send(users)
      } else {
        const error = new Error()
        error.httpStatusCode = 404
        next(error)
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

usersRouter.put(
  "/:userId/products/:productId",
  async (req, res, next) => {
    try {
      const users = await getUsers()
      const userIndex = users.findIndex(
        user => user._id === req.params.userId
      )

      if (userIndex !== -1) {
        const productIndex = users[userIndex].products.findIndex(
          product => product._id === req.params.productId
        )

        if (productIndex !== -1) {
          const previousProduct = users[userIndex].products[productIndex]

          const updateProduct = [
            ...users[userIndex].products.slice(0, productIndex), // {}, {}, {}
            { ...previousProduct, ...req.body, updatedAt: new Date() }, // previousReview:{ _id: 1, rate: 1, comment: "old comment"} req.body: { comment: "new comment"}, newObject: {_id, rate: 1, comment: "new comment"}
            ...users[userIndex].products.slice(productIndex + 1),
          ] // [before the specific review I'm trying to modify, {the modified review}, after the specified review I'm trying to modify]
          // [{}, {}, {}, {x}, {}, {}]
          users[userIndex].products = updateProduct

          await writeUsers(users)
          res.send(users)
        } else {
          console.log("product not found")
        }
      } else {
        console.log("user not found")
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

usersRouter.delete(
  "/:userId/products/:productId",
  async (req, res, next) => {
    try {
      const users = await getUsers()

      const userIndex = users.findIndex(
        user => user._id === req.params.userId
      )

      if (userIndex !== -1) {
        users[userIndex].products = users[userIndex].products.filter(
          product => product.ID !== req.params.productId
        )

        await writeUsers(users)
        res.send(users)
      } else {
      }
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

module.exports = usersRouter