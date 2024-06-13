const Carteira = require('./Carteira');
const Categoria = require('./Categoria');
const Despesa = require('./Despesa');

Carteira.hasMany(Despesa, { foreignKey: 'carteiraId' });

Despesa.belongsTo(Carteira, { foreignKey: 'carteiraId' });
Despesa.belongsTo(Categoria, { as: 'Categoria', foreignKey: 'categoriaId' });

Categoria.hasMany(Despesa, { as: 'Categoria', foreignKey: 'categoriaId' });
Categoria.belongsTo(Carteira, { foreignKey: 'carteiraId' });


module.exports = {
    Carteira,
    Categoria,
    Despesa
}