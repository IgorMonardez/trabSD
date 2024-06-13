const { Receita } = require("../models/Associations");
const Subject = require("./Subject");

class ReceitaService extends Subject {
    constructor() {
        super();
    }

    async createReceita(data, descricao, valor, carteiraId, carteiraService) {
        let carteira = await carteiraService.getCarteiraById(carteiraId);
        if(!carteira) {
            throw new Error("Carteira não encontrada.");
        }

        await Receita.create({
            data: Date.parse(data),
            descricao: descricao,
            valor: valor,
            carteiraId: carteiraId,
        })

        this.addObserver(carteiraService);
        this.notifyObservers(carteiraId, valor, true);
    }

    async editReceita(data, descricao, valor, id, carteiraId) {
        let updatedReceita = await Receita.update(
            { data, descricao, valor },
            { where: { id, carteiraId } }
        )
        if(updatedReceita[0] !== 1) {
            throw new Error("Receita não encontrada.");
        }
    }

    async deleteReceita( id, carteiraId, carteiraService) {
        let carteira = await carteiraService.getCarteiraById(carteiraId);
        if(!carteira) {
            throw new Error("Carteira não encontrada.");
        }

        let receita = await this.getReceitaById(id, carteiraId);
        if (!receita) {
            throw new Error("Receita não encontrada.");
        }

        let valor = receita.valor;

        await receita.destroy();
        this.addObserver(carteiraService);
        this.notifyObservers(carteiraId, valor, false);
    }

    async deleteAllReceitas(carteiraId) {
        await Receita.destroy({
            where: {
                carteiraId: carteiraId
            }
        })
    }

    async getReceitaById(id, carteiraId) {
        return await Receita.findOne({
            where: {
                id: id,
                carteiraId: carteiraId
            }
        })
    }

    async getReceitas(carteiraId) {
        return await Receita.findAll({
            where: {
                carteiraId: carteiraId
            }
        })
    }
}

module.exports = ReceitaService;