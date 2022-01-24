/* Módulos */
const express = require('express'); /* Importa o módulo express */
const exphbs = require('express-handlebars'); /* Importa o módulo express-handlebars */
const path = require('path'); /* Importa o módulo path */

/* Constante */
const root = path.join(__dirname, '..'); /* Define o caminho para a raiz do projeto */
const app = express(); /* Define o objeto app do express */

/* Definições */
app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars'); /* Define a view engine como sendo o handlebars */

app.set('views', path.join(root, 'app/views')); /* Define o caminho onde as views estão armazenadas */
app.use(express.static(path.join(root, 'static'))); /* Define o caminho onde os arquivos estáticos estão armazernados */

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/* Exportação */
module.exports = app;