const Carteira = require('./Carteira');
const Categoria = require('./Categoria');


Categoria.belongsTo(Carteira, { foreignKey: 'carteiraId' });


module.exports = {
    Carteira,
    Categoria,
}