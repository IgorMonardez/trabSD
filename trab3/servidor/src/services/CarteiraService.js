const {Carteira} = require("../models/Associations");

class CarteiraService {
    constructor() {

    }

    async createCarteira(){
        return await Carteira.create({
         saldo: 0,
         });
    }

    async getCarteiraById(carteiraId) {
        return await Carteira.findByPk(carteiraId);
    }
}

module.exports = CarteiraService;