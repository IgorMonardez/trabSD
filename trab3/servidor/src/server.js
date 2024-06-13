const express = require('express');
const cors = require('cors');

const { sequelize } = require('./config/db');

const walletRoutes = require('./routes/carteiraRoutes');
const categoryRoutes = require('./routes/categoriaRoutes');
const expenseRoutes = require('./routes/despesaRoutes');

const app = express();
app.use(cors());
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexão com o banco de dados
sequelize.sync()
    .then(() => {
        console.log('Database synced');
    })
    .catch((error) => {
        console.error('Error syncing database: ', error);
    });

// Rotas
app.use('/wallets', walletRoutes);
app.use('/category', categoryRoutes);
app.use('/expense', expenseRoutes);

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
})
