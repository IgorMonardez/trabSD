const express = require('express');
const router = express.Router();
const CarteiraController = require('../controllers/CarteiraController');

const carteiraController = new CarteiraController();

router.get('/getCarteiraById/:id', carteiraController.getCarteiraById.bind(carteiraController));
router.post('/createCarteira/', carteiraController.createCarteira.bind(carteiraController));

module.exports = router;