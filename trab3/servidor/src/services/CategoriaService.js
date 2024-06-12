const Categoria = require("../models/Categoria")
const CarteiraService = require("./CarteiraService");

class CategoriaService {
    constructor() {

    }

    async createCategoria(nome, carteiraId) {
        let carteiraService = new CarteiraService();
        let carteira = await carteiraService.getCarteiraById(carteiraId);
        if(!carteira) {
            throw new Error("Carteira não encontrada");
        }

        await Categoria.create({
            nome: nome,
            limite: 0,
            carteiraId: carteiraId
        });
    }


    async getCategoria(id, carteiraId) {
        return await Categoria.findOne({ where: { id, carteiraId } });
    }

    async getCategorias(carteiraId) {
        return await Categoria.findAll({ where: { carteiraId } });
    }

    async editCategoria(id, carteiraId, nome, limite) {
        let updatedCategoria = await Categoria.update(
            { nome, limite },
            { where: { id, carteiraId } }
        )

        if(updatedCategoria[0] !== 1) {
            throw new Error('Categoria não encontrada.');
        }
    }

    async deleteCategoria(id, carteiraId) {
        let categoria = await this.getCategoria(id, carteiraId);
        if(!categoria) {
            throw new Error("Categoria não encontrada");
        }

        categoria.destroy();
    }

    async deleteAllCategorias(carteiraId) {
        await Categoria.destroy({ where: { carteiraId } });
    }
}

module.exports = CategoriaService;