import multer from "multer";

// file uploading
const storage = multer.diskStorage({
  // cb is the callback function
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.originalname + " - " + uniqueSuffix);
  },
});

export const upload = multer({ storage });