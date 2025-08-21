const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, "..", "uploads", "attendance");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = uuidv4();
    cb(null, `${id}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowed = ["image/png", "image/jpeg", "image/jpg"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only PNG and JPG are allowed"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// base64 fallback handler
async function handleBase64Image(dataUrl) {
  if (!dataUrl) return null;
  const match = /^data:(image\/(png|jpeg|jpg));base64,(.+)$/.exec(dataUrl);
  if (!match) return null;

  const mime = match[1];
  const buffer = Buffer.from(match[3], "base64");
  const ext = mime === "image/png" ? ".png" : ".jpg";
  const id = uuidv4();

  const dir = path.join(__dirname, "..", "uploads", "attendance");
  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${id}${ext}`);
  fs.writeFileSync(filePath, buffer);

  return { filename: `${id}${ext}`, path: filePath, mime };
}

module.exports = {
  upload,
  handleBase64Image,
};
