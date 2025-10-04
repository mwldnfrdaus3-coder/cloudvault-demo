const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();
const PORT = 3000;      // HTTP
const SSLPORT = 3443;   // HTTPS

// Folder upload
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// Middleware
app.use(express.static(__dirname)); // biar index.html bisa diakses
app.use(bodyParser.json());

// Konfigurasi multer (untuk upload file)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Upload file
app.post("/upload", upload.single("file"), (req, res) => {
  res.json({ message: "File uploaded successfully!", file: req.file });
});

// Simpan teks
app.post("/save-text", (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    return res.status(400).json({ error: "Filename and content required" });
  }
  const filePath = path.join(UPLOAD_DIR, `${filename}.txt`);
  fs.writeFileSync(filePath, content, "utf-8");
  res.json({ message: `Text saved as ${filename}.txt` });
});

// List files
app.get("/files", (req, res) => {
  const files = fs.readdirSync(UPLOAD_DIR).map(f => {
    const stat = fs.statSync(path.join(UPLOAD_DIR, f));
    return { filename: f, size: stat.size };
  });
  res.json({ files });
});

// Serve file
app.get("/files/:name", (req, res) => {
  const safe = path.basename(req.params.name);
  const filePath = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  res.download(filePath);
});

// Delete file
app.delete("/files/:name", (req, res) => {
  const safe = path.basename(req.params.name);
  const filePath = path.join(UPLOAD_DIR, safe);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: "Not found" });
  fs.unlinkSync(filePath);
  res.json({ message: `${safe} deleted` });
});

// Jalankan HTTP server
app.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
});

// Jalankan HTTPS server
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
};

https.createServer(options, app).listen(SSLPORT, () => {
  console.log(`HTTPS server running at https://localhost:${SSLPORT}`);
});