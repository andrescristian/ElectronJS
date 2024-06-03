const {model, Schema} = require('mongoose')

//Criar um Objeto --> Modelo para coleção
//IMPORTANTE: Nomes dos Atributos serem iguais ao Objeto recebido pelo main.js
const tarefaSchema = new Schema({
    nome: {
        type: String
    },
    descricao: {
        type: String
    }
})

//Exportar o Schema -> main.js
module.exports = model('Tarefa', tarefaSchema)
