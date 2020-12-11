const express = require("express")
const fs = require("fs")
const path = require("path")
const { writeFile, createReadStream } = require("fs-extra")
const uniqid = require("uniqid")
const multer = require("multer");
const { pipeline } = require("stream");
const { readDB, writeDB } = require("../lib/utilities");

const { check, validationResult } = require("express-validator")
const upload = multer({});

const router = express.Router()

const readFile = fileName => {
  const buffer = fs.readFileSync(path.join(__dirname, fileName))
  const fileContent = buffer.toString()
  return JSON.parse(fileContent)
}

router.get("/:id", (req, res, next) => {
  try {
    const reviewsDB = readFile("reviews.json")
    const review = reviewsDB.filter(review => review.ID === req.params.id)
    if (review.length > 0) {
      res.send(review)
    } else {
      const err = new Error()
      err.httpStatusCode = 404
      next(err)
    }
  } catch (error) {
    next(error)
  }
})


router.get("/", (req, res, next) => {
  try {
    const reviewsDB = readFile("reviews.json")
    if (req.query && req.query.name) {
      const filteredreviews = reviewsDB.filter(
        review =>
          review.hasOwnProperty("name") &&
          review.name.toLowerCase() === req.query.name.toLowerCase()
      )
      res.send(filteredreviews)
    } else {
      res.send(reviewsDB)
    }
  } catch (error) {
    next(error)
  }
})

router.post(
  "/",
  [
    check("name")
      .isLength({ min: 4 })
      .withMessage("No way! Name too short!")
      .exists()
      .withMessage("Insert a name please!"),

      check("elementId")
      .exists()
      .withMessage("you need a product id for posting a review")
  ],
 
  (req, res, next) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        const err = new Error()
        err.message = errors
        err.httpStatusCode = 400
        next(err)
      } else {
        const reviewsDB = readFile("reviews.json")
        const newreview = {
          ...req.body,
          ID: uniqid(),
          modifiedAt: new Date(),
        }
        reviewsDB.push(newreview)
        fs.writeFileSync(
          path.join(__dirname, "reviews.json"),
          JSON.stringify(reviewsDB)
        )
        res.status(201).send({ newreview })
      }
    } catch (error) {
      next(error)
    }
  }
)
const projectsImagePath = path.join(__dirname, "../../public/img/products");

router.post(
    "/:id/upload",
    upload.single("productPhoto"),
    async (req, res, next) => {
      let nameArray = req.file.originalname.split(".");
      let fileType = "." + nameArray.pop();
      console.log(nameArray);
      console.log(fileType);
      try {
        await writeFile(
          path.join(projectsImagePath, req.params.id + fileType),
          req.file.buffer
        );
        res.send("ok");
      } catch (error) {
        console.log(error);
        next(error);
      }
    }
  );

router.delete("/:id", (req, res, next) => {
  try {
    const reviewsDB = readFile("reviews.json")
    const newDb = reviewsDB.filter(review => review.ID !== req.params.id)
    fs.writeFileSync(path.join(__dirname, "reviews.json"), JSON.stringify(newDb))

    res.status(204).send("deleted")
  } catch (error) {
    next(error)
  }
})

router.put("/:id", (req, res, next) => {
  try {
    const reviewsDB = readFile("reviews.json")
    const newDb = reviewsDB.filter(review => review.ID !== req.params.id)

    const modifiedreview = {
      ...req.body,
      ID: req.params.id,
      modifiedAt: new Date(),
    }

    newDb.push(modifiedreview)
    fs.writeFileSync(path.join(__dirname, "reviews.json"), JSON.stringify(newDb))
    res.send("updated!")
    res.send({ id: modifiedreview.ID })
  } catch (error) {
    next(error)
  }
})

module.exports = router