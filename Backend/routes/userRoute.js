const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const check = require('../middlewares/auth');

// Configuración de multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars');
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Definiendo rutas
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile/:id", check.auth, userController.profile);
router.get("/list/:page?", check.auth, userController.list);
router.put("/update", check.auth, userController.update);
router.post("/upload", [check.auth, upload.single("file0")], userController.upload);
router.get("/avatar/:file", userController.avatar);
router.get("/counters/:id?", check.auth, userController.counters);

module.exports = router;
