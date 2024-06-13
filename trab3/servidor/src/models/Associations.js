const Carteira = require('./Carteira');
const Categoria = require('./Categoria');
const Despesa = require('./Despesa');
const Receita = require('./Receita');

Carteira.hasMany(Despesa, { foreignKey: 'carteiraId' });
Carteira.hasMany(Receita, { foreignKey: 'carteiraId' });

Despesa.belongsTo(Carteira, { foreignKey: 'carteiraId' });
Despesa.belongsTo(Categoria, { as: 'Categoria', foreignKey: 'categoriaId' });

Receita.belongsTo(Carteira, { foreignKey: 'carteiraId' });

Categoria.hasMany(Despesa, { as: 'Categoria', foreignKey: 'categoriaId' });
Categoria.belongsTo(Carteira, { foreignKey: 'carteiraId' });


module.exports = {
    Carteira,
    Categoria,
    Despesa,
    Receita
}