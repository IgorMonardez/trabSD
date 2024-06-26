const DespesaService = require("../services/DespesaService");
const CarteiraService = require("../services/CarteiraService");

class DespesaController {
    constructor() {
        this.despesaService = new DespesaService();

        this.createDespesa = this.createDespesa.bind(this);
        this.editDespesa = this.editDespesa.bind(this);
        this.deleteDespesa = this.deleteDespesa.bind(this);
        this.getDespesaById = this.getDespesaById.bind(this);
        this.getDespesas = this.getDespesas.bind(this);
    }

    async createDespesa(req, res) {
        try {
            const { carteiraId } = req.params;
            const { tipo, data, tag, descricao, origem, valor,
                categoriaId, parcela, nomeCobranca } = req.body;

            if (!tipo || !data || !tag || !descricao || !origem || !valor || !categoriaId || !parcela || !nomeCobranca) {
                return res.status(400).json({ error: 'Todos os campos (nome, data, tag, descrição, origem, valor) ' +
                        'são obrigatórios.' });
            }

            let carteiraService = new CarteiraService();

            await this.despesaService.createDespesa(tipo, data, tag, descricao, origem, valor, carteiraId, categoriaId, parcela, nomeCobranca, carteiraService)
                .then(() => {
                    res.status(200).json({message: `Despesa criada com sucesso.`});
                })
                .catch((error) => {
                    res.status(400).json({ error: `Erro ao criar despesa: ${error}` });
                });
        }
        catch (e) {
            res.status(500).json({ error: 'Erro ao adicionar uma despesa: ' + e });
        }
    }

    async editDespesa(req, res)  {
        try {
            const { carteiraId } = req.params;
            const { id, tipo, data, tag, descricao, origem, valor, categoriaId } = req.body;

            let carteiraService = new CarteiraService();

            await this.despesaService.editDespesa(
                tipo, data, tag, descricao, origem, valor, categoriaId, id, carteiraId, carteiraService
            )
                .then(() => {
                    res.status(200).json({ message: 'Despesa atualizada com sucesso.' });

                })
                .catch((error) => {
                    res.status(400).json({ error: `Erro ao atualizar despesa: ${error}` });
                });

        }
        catch (e) {
            res.status(500).json({ error: 'Erro ao atualizar a despesa.' + e });
        }
    }

    async deleteDespesa(req, res) {
        try {
            const { carteiraId } = req.params;
            const { id } = req.body;

            let carteiraService = new CarteiraService();
            await this.despesaService.deleteDespesa(id, carteiraId, carteiraService)
                .then(() => {
                    res.status(200).json({ message: 'Despesa excluída com sucesso. ' });
                })
                .catch((error) => {
                    res.status(400).json({ error: `Erro ao deletar despesa: ${error}` });
                });
        }
        catch (e) {
            res.status(500).json({ error: 'Erro ao deletar despesa: ' + e });
        }
    }

    async getDespesaById(req, res) {
        try {
            const { carteiraId } = req.params;
            const { id } = req.body;

            await this.despesaService.getDespesaById(id, carteiraId)
                .then(despesa => {
                    res.status(200).json(despesa);
                })
                .catch((error) => {
                    res.status(400).json({ error: `Erro ao buscar despesa: ${error}` });
                });
        }
        catch (e) {
            res.status(500).json({ error: 'Erro ao recuperar despesa: ' + e });
        }
    }

    async getDespesas(req, res){
        try {
            const { carteiraId } = req.params;

            await this.despesaService.getDespesas(carteiraId)
                .then(despesas => {
                    res.status(200).json(despesas);
                })
                .catch((error) => {
                    res.status(400).json({ error: `Erro ao buscar despesas: ${error}` });
                });

        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar despesas' });
        }
    }
}

module.exports = DespesaController