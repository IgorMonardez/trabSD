const CarteiraService = require("../services/CarteiraService");

class CarteiraController {
    constructor() {
        this.carteiraService = new CarteiraService();

        this.createCarteira = this.createCarteira.bind(this);
    }

    async createCarteira(req, res) {
        try {

            await this.carteiraService.createCarteira()
                .then(() => {
                    res.status(200).json({ message: `Carteira criada com sucesso.` });
                })
                .catch((error) => {
                    res.status(404).json({ error: 'Erro ao criar a carteira: ' + error});
                });

        }
        catch(e) {
            res.status(500).json({ error: 'Erro ao criar a carteira: ' + e});
        }
    }

    async getCarteiraById(req, res) {
        try {
            let carteiraId = req.params.id;
            await this.carteiraService.getCarteiraById(carteiraId)
                .then((carteira) => {
                    res.status(200).json(carteira);
                })
                .catch((error) => {
                    res.status(404).json({ error: 'Erro ao buscar a carteira: ' + error});
                });
        }
        catch(e) {
            res.status(500).json({ error: 'Erro ao buscar a carteira: ' + e});
        }
    }

}

module.exports = CarteiraController