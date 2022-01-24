/* Módulos */
require('dotenv').config(); /* Configuração das variáveis de ambiente */
const app = require('./configs/app'); /* Configuração do app */

const indexRouter = require('./app/routes/index.route'); /* Importa a rota / */

/* Constante */
const PORT = process.env.PORT || 3050; /* Define a porta na qual a aplicação vai rodar */

/* Rotas */
app.use(indexRouter); /* Adiciona ao middleware a rota / */

/* Abre o servidor na porta especificada */
app.listen(PORT, () => {
	console.log( '\n##### -- Server Running: Success\nLink: http://localhost:' + PORT + '\n');
});