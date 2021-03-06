const express = require("express");
const cloudinary = require("cloudinary")
const multer = require("multer")
const dotenv = require("dotenv");

dotenv.config();
const app = express();
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const {
  NODE_ENV,
  PORT: productionPort,
  IP: productionIP,
  CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;


const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

cloudinary.v2.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const upload = multer({ storage });

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Multiple uploader api",
  });
});

app.post("/images", upload.array("pictures", 10), async (req, res) => {
  try {
    let pictureFiles = req.files;
    if (!pictureFiles)
      return res.status(400).json({ message: "No picture attached!" });
    //map through images and create a promise array using cloudinary upload function
    let multiplePicturePromise = pictureFiles.map((picture) =>
      cloudinary.v2.uploader.upload(picture.path)
    );
    let imageResponses = await Promise.all(multiplePicturePromise);
    res.status(200).json({ images: imageResponses });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

if (NODE_ENV === "production") {
  app.listen(productionPort, productionIP, () =>
    console.log("Multiple uploader api started in production!")
  );
} else {
  app.listen(9000, () =>
    console.log("Multiple uploader api started in development on port 9000!")
  );
}