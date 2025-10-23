import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";

const router = express.Router();

// === Upload directory ===
const UPLOAD_FOLDER = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });

// === Allowed extensions ===
const ALLOWED_EXTENSIONS = [".xlsx", ".json", ".pdf"];

// === Multer setup (for handling file uploads) ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder?.toLowerCase();
    if (!folder || !["faculty", "students", "admin"].includes(folder)) {
      return cb(new Error("Invalid folder"));
    }
    const folderPath = path.join(UPLOAD_FOLDER, folder);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

// === Helper function to check allowed file types ===
function isAllowed(filename) {
  return ALLOWED_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(ext));
}

// === List all files in upload folders ===
router.get("/files", (req, res) => {
  const result = { faculty: [], students: [], admin: [] };

  for (const folder of Object.keys(result)) {
    const folderPath = path.join(UPLOAD_FOLDER, folder);
    if (fs.existsSync(folderPath)) {
      result[folder] = fs
        .readdirSync(folderPath)
        .filter(f => fs.statSync(path.join(folderPath, f)).isFile());
    }
  }

  res.json({ files: result });
});

// === Upload a file ===
router.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  const folder = req.body.folder?.toLowerCase();
  const overwrite = req.body.overwrite === "true";

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  if (!isAllowed(file.originalname)) {
    return res.status(400).json({ message: "File type not allowed" });
  }

  if (!["faculty", "students", "admin"].includes(folder)) {
    return res.status(400).json({ message: "Invalid folder" });
  }

  const targetPath = path.join(UPLOAD_FOLDER, folder, file.originalname);

  // Handle duplicate file
  if (fs.existsSync(targetPath) && !overwrite) {
    return res.status(409).json({
      message: `⚠️ File '${file.originalname}' already exists in ${folder}/. Overwrite?`,
      duplicate: true,
    });
  }

  // File is already saved by Multer, so just return success
  res.json({ message: "File uploaded successfully!", filename: file.originalname });
});

// === Delete uploaded file ===
router.delete("/delete_upload/:category/:filename", (req, res) => {
  const { category, filename } = req.params;
  if (!["faculty", "students", "admin"].includes(category)) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const filePath = path.join(UPLOAD_FOLDER, category, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  try {
    fs.unlinkSync(filePath);
    res.json({ message: "File deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
