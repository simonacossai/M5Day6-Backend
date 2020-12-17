const {Router} = require("express");
const {body,validationResult,check} = require("express-validator");
const express = require("express")
const fs = require("fs")
const path = require("path")
const { Transform } = require("json2csv")
const {writeFile,createReadStream} = require("fs-extra")
const uniqid = require("uniqid")
const multer = require("multer");
const {pipeline} = require("stream");
const {join}= require("path")
const {readDB,writeDB} = require("../lib/utilities");
const { parseString } = require("xml2js")
const publicIp = require("public-ip")
const axios = require("axios")
const { promisify } = require("util")
const { begin } = require("xmlbuilder")
const upload = multer({});

const router = express.Router()

const asyncParser = promisify(parseString)

const fileReader = (file) => {
    const myPath = path.join(__dirname, file);
    const myFileAsBuffer = fs.readFileSync(myPath);
    const fileAsString = myFileAsBuffer.toString();
    return JSON.parse(fileAsString);
};

router.get("/", (req, res, next) => {
    try {
        const productsArray = fileReader("products.json");
        res.send(productsArray);
    } catch (error) {
        console.log(error);
        next(error);
    }
});

router.get("/:id", (req, res, next) => {
    try {
        const productsArray = fileReader("products.json");
        const idFromReq = req.params.id;
        const products = productsArray.filter(
            (products) => products.ID === idFromReq
        );

        res.send(products);
        console.log(products);
    } catch (err) {
        console.log(err);
    }
});

router.post(
    "/",
    [
        check("name")
        .isLength({
            min: 4
        })
        .withMessage("No way! Name too short!")
        .exists()
        .withMessage("Insert a name please!"),
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
                const projectsDB = fileReader("products.json")
                const newproject = {
                    ...req.body,
                    ID: uniqid(),
                    modifiedAt: new Date(),
                }

                projectsDB.push(newproject)

                fs.writeFileSync(
                    path.join(__dirname, "products.json"),
                    JSON.stringify(projectsDB)
                )

                res.status(201).send({
                    id: newproject.ID
                })
            }
        } catch (error) {
            next(error)
        }
    }
)
const productFolderPath = path.join(__dirname, "../../public/img/products")

router.post("/:id/upload", upload.single("productPhoto"), async (req, res, next) => {
    try {
        const productfile = fileReader("products.json");
        await writeFile(
            path.join(productFolderPath, req.file.originalname),
            req.file.buffer
        );
        const filteredFile = productfile.filter((product) => product.ID !== req.params.id);
        const product = await productfile.filter((product) => product.ID === req.params.id);
        product[0].image = `http://localhost:3001/img/products/${req.file.originalname.toString()}`;
        filteredFile.push(product[0]);
        fs.writeFileSync(path.join(__dirname, "products.json"), JSON.stringify(filteredFile));
        res.send("Image uploaded!");
    } catch (error) {
        console.log(error);
        next(error);
    }
});



router.put("/:id", (req, res, next) => {
    const productsArray = fileReader("products.json");

    const newproductArray = productsArray.filter(
        (products) => products.ID !== req.params.id
    );

    const modifiedproducts = req.body;

    modifiedproducts.ID = req.params.id;
    newproductArray.push(modifiedproducts);

    fs.writeFileSync(
        path.join(__dirname, "products.json"),
        JSON.stringify(newproductArray)
    );

    console.log("PUT ID");
    res.status(200).send();
});

router.delete("/:id", (req, res, next) => {
    const productsArray = fileReader("products.json");
    const newproductArray = productsArray.filter(
        (products) => products.ID !== req.params.id
    );

    fs.writeFileSync(
        path.join(__dirname, "products.json"),
        JSON.stringify(newproductArray)
    );
    console.log("DELETE ID");
    res.status(200).send();
});

router.get("/export/ToCSV", (req, res, next) => {
    try {
      const path = join(__dirname, "products.json")
      const jsonReadableStream = createReadStream(path)
  
      const json2csv = new Transform({
        fields: ["name", "brand", "price", "category", "ID", "image"],
      })
  
      res.setHeader("Content-Disposition", "attachment; filename=export.csv")
      pipeline(jsonReadableStream, json2csv, res, err => {
        if (err) {
          console.log(err)
          next(err)
        } else {
          console.log("CSV downloaded")
        }
      })
    } catch (error) {
      next(error)
    }
  })


/*
POST /calculator.asmx HTTP/1.1
Host: www.dneonline.com
Content-Type: text/xml; charset=utf-8
Content-Length: length
SOAPAction: "http://tempuri.org/Add"

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <Add xmlns="http://tempuri.org/">
      <intA>int</intA>
      <intB>int</intB>
    </Add>
  </soap:Body>
</soap:Envelope> */

  
router.get("/sum/TwoPrices", async (req, res, next) => {
    try {
      const { firstID, secondID } = req.query

    const productfile = fileReader("products.json");
    const firstProduct = productfile.filter((product) => product.ID === firstID);
    const secondProduct = productfile.filter((product) => product.ID === secondID);

    const firstPrice = firstProduct[0].price;
    const secondPrice = secondProduct[0].price;
  //create a http request (POST on http://www.dneonline.com/calculator.asmx?op=Add)
  //i need to build xml body to send in my request
    const xmlBody = begin()
        .ele("soap:Envelope", {
          "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
          "xmlns:xsd": "http://www.w3.org/2001/XMLSchema",
          "xmlns:soap": "http://schemas.xmlsoap.org/soap/envelope/"
        })
        .ele("soap:Body")
        .ele("Add", {
          xmlns: "http://tempuri.org/",
        })
        .ele("intA")
        .text(firstPrice)
        .up()
        .ele("intB")
        .text(secondPrice)
        .end()
        
        const response= await axios({
            method: 'post',
            url: 'http://www.dneonline.com/calculator.asmx?op=Add',
            headers:{"Content-type": "text/xml"},
            data:xmlBody,
        })
        const parsedJS = await asyncParser(response.data)
        res.send(parsedJS)
    } catch (error) {
      console.log(error)
      next(error)
    }
  })

module.exports = router;