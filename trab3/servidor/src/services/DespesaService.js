const Subject = require("./Subject");
const CategoriaService = require("./CategoriaService");
const { Despesa } = require("../models/Associations");

class DespesaService extends Subject {
    constructor() {
        super();
    }

    async createDespesa(tipo, data, tag, descricao, origem, valor, carteiraId, categoriaId, parcela, nomeCobranca, carteiraService) {
        try {
            let categoriaService = new CategoriaService();

            let carteira = await carteiraService.getCarteiraById(carteiraId);
            if (!carteira) {
                throw new Error('Carteira não encontrada.');
            }

            let categoria = await categoriaService.getCategoria(categoriaId, carteiraId);
            if (!categoria) {
                throw new Error('Categoria não encontrada.');
            }

            let numParcelas = parcela;
            let despesaData = new Date(data);

            let valorDaParcela = valor / parcela;

            for (let i = 0; i < numParcelas; i++) {
                await Despesa.create({
                    tipo: tipo,
                    data: despesaData,
                    tag: tag,
                    descricao: descricao,
                    origem: origem,
                    valor: valorDaParcela.toFixed(2),
                    carteiraId: carteiraId,
                    categoriaId: categoriaId,
                    parcela: `${i + 1}/${numParcelas}`,
                    nomeCobranca: nomeCobranca,
                });

                this.addObserver(carteiraService);
                this.notifyObservers(carteiraId, valor, false);
                despesaData.setMonth(despesaData.getMonth() + 1);
            }
        } catch (error) {
            console.log(error);
            return error;
        }
    }

    async editDespesa(tipo, data, tag, descricao, origem, valor, categoriaId, id, carteiraId, carteiraService) {
        let despesa = await this.getDespesaById(id, carteiraId);
        if (!despesa) {
            throw new Error("Despesa não encontrada.");
        }

        let oldValor = despesa.valor;

        let updatedDespesa = await Despesa.update(
            { tipo, data, tag, descricao, origem, valor, categoriaId },
            { where: { id, carteiraId } }
        )

        if (updatedDespesa[0] !== 1) {
            throw new Error('Despesa não encontrada.');
        }

        let diffValor = valor - oldValor;
        let isAdd = diffValor >= 0;

        let carteira = await carteiraService.getCarteiraById(carteiraId);
        if(!carteira) {
            throw new Error("Carteira não encontrada.");
        }

        this.addObserver(carteiraService);
        this.notifyObservers(carteiraId, Math.abs(diffValor), isAdd);
    }

    async deleteDespesa(id, carteiraId, carteiraService) {
        let despesa = await this.getDespesaById(id, carteiraId);

        if (!despesa) {
            throw new Error('Despesa não encontrada.');
        }
        let valor = despesa.valor;

        despesa.destroy();

        this.addObserver(carteiraService)
        this.notifyObservers(carteiraId, valor, true);

    }

    async getDespesaById(id, carteiraId) {
        let despesa = await Despesa.findOne({
            where: {
                id: id,
                carteiraId: carteiraId
            }
        })
        if (!despesa) {
            throw new Error('Despesa não encontrada.');
        }
        else {
            return despesa;
        }
    }

    async getDespesas(carteiraId) {
        return await Despesa.findAll({ where: { carteiraId } });
    }
}

module.exports = DespesaService;