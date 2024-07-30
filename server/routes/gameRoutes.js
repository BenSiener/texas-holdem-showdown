const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

router.post('/start', gameController.startGame);
router.post('/bet', gameController.bet);
router.post('/call', gameController.call);
router.post('/pass', gameController.pass);
router.post('/fold', gameController.fold);

module.exports = router;
