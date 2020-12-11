const express = require("express");
const multer = require("multer");
const { writeFile } = require("fs-extra");
const { join } = require("path");

const router = express.Router();

const upload = multer({});

const productsImagePath = join(__dirname, "../../public/img/products");

router.post("/", upload.single("productPhoto"), async (req, res, next) => {
  console.log(req.params.id);
  console.log(req.file.originalname);
  try {
    await writeFile(
      join(productsImagePath, req.file.originalname),
      req.file.buffer
    );
    res.send("ok");
  } catch (error) {
    console.log(error);
    next(error);
  }
});

module.exports = router;