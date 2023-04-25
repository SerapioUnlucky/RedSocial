const express = require('express');
const router = express.Router();
const followController = require('../controllers/followController');
const check = require('../middlewares/auth');

router.post("/save", check.auth, followController.save);
router.delete("/unfollow/:id", check.auth, followController.unfollow);
router.get("/following/:id?/:page?", check.auth, followController.following);
router.get("/followers/:id?/:page?", check.auth, followController.followers);

module.exports = router;
