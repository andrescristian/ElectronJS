const { ipcRenderer } = require('electron')

/*
* Status de Conexão
*/

//Enviar uma mensagem ao processo principal - Correção do BUG do Ícone Status - Passo 1 Slide
ipcRenderer.send('send-message', "Status do Banco de Dados:")

//Receber mensagens do processo sobre o status da conexão - Passo 4 Slide
ipcRenderer.on('db-status', (event, status) => {
    console.log(status)
    if (status === "Banco de Dados conectado") {
        document.getElementById("status").src = "../public/img/dbon.png"
    } else {
        document.getElementById("status").src = "../public/img/dboff.png"
    }
})
/*Fim do Status de Conexão*/

//1º Parte do CRUD (Create, Read, Update, Delete)
//CRUD CREATE - Inserir Dados na Coleção
//Passo 1 Slide --> Receber os dados do form
//*Obs: querySelector recebe o conteúdo relacionado ao id
//Variável "lista" do Passo 4.2
let formulario      = document.querySelector("#frmTarefas")
let nomeTarefa      = document.querySelector("#txtTarefa")
let descricaoTarefa = document.querySelector("#txtDescricao")
let lista           = document.querySelector("#listaTarefas") //Esta linha vai preencher os dados na coluna da página Passo 4.2

let arrayTarefas = []   //Passo 4.3 do CRUD READ
let updateStatus = false //Passo 1.5 do CRUD UPDATE
let idTarefa //Passo 1.5 do CRUD UPDATE


//Método que vai receber os dados do Formulário ao pressionar o Botão "Salvar"
formulario.addEventListener("submit", async (event) => {
    event.preventDefault() //Ignorar o comportamento padrão (reiniciar o Documento APÓS o envio dos dados do Formulário)
    //console.log("Recebendo")
    //console.log(nomeTarefa.value, descricaoTarefa.value)//Teste para ver se estou recebendo os Dados

    //Criar uma estrutura de dados usando objeto para Envio ao main.js (Argumentos)
    const tarefa = {
        nome: nomeTarefa.value,
        descricao: descricaoTarefa.value
    }

    //Passo 3 - Crud Update (Criar uma estrutura do tipo if else para reutilização do formulário ) e enviar para o main.js
    if (updateStatus === false) {

        //Passo 2 do Slide --> Envio dos Dados para o Main
        //send = envia,  on = recebe
        ipcRenderer.send('new-task', tarefa)
    } else {
        ipcRenderer.send('update-task', { ...tarefa, idTarefa })
    }

    formulario.reset()  //Limpar o Formulario APOS O ENVIO
})
//Fim do Método que Recebe os Dados

//Confirmar cadastro (da Tarefa) do Banco de Dados SE der certo
ipcRenderer.on('new-task-created', (event, args) => {
    //CRUD READ - Passo extra: atualizar a lista automaticamente quando uma nova tarefa for adicionada ao banco
    const novaTarefa = JSON.parse(args)
    arrayTarefas.push(novaTarefa)
    renderizarTarefas(arrayTarefas)
})
//Fim da Confirmação de Dados





//>>>>>>>>>>>>>>>>>>>>>>>>>>>>
//2º Passo do CRUD (Create, Read, Update, Delete)
//CRUD READ - Buscar os Dados do Banco
//Enviar para o Main um pedido para buscar as Tarefas pendentes no Banco de Dados (Passo 1 Slide)
ipcRenderer.send('get-tasks')

//Passo 3 (Slide) Receber as Tarefas pendentes do main
ipcRenderer.on('pending-tasks', (event, args) => {
    console.log(args) //Passo 3 - Fins didáticos teste de recebimento das Tarefas pendentes

    //Passo 4 - Renderizar as tarefas pendentes no Documento index.html
    /**
     * 4.1 Criar uma lista ou tabela no html
     * 4.2 Capturar o id a lista ou tabela
     * 4.3 Criar um Vetor para estruturar os dados
     * 4.4 Criar uma Função para renderizar a Lista ou Tabela
     */

    //Continuaçao do Passo4... Criar uma constante para receber as Tarefas pendentes
    //JSON.parse (Garantir o formato JSON)
    const tarefasPendentes = JSON.parse(args)

    //Atribuir ao Vetor
    arrayTarefas = tarefasPendentes
    console.log(arrayTarefas) //Fins didáticos - exibir a estrutura de Dados no Console

    //Executar a Função renderizarTarefas() passando o array como parâmetro
    renderizarTarefas(arrayTarefas)
})


//Passo 4: Função usada para Renderizar (exibir) os dados em uma lista ou tabela usando a linguagem html
function renderizarTarefas(tasks) {
    lista.innerHTML = "" //Limpar a Lista antes de renderizar

    //Percorrer o Array - Vai mostrar os Valores no HTML usando a letra "t" Ex: t._id, t.nome
    tasks.forEach((t) => {
        lista.innerHTML += `
        <li class="Card">
        <h5>Id: ${t._id}</h5>
        <h4> ${t.nome} </h4> 
        <p> ${t.descricao}</p>
        <button onclick="editarTarefa('${t._id}')"  id="btnEditar">Editar</button>
        <button onclick="excluirTarefa('${t._id}')" id="btnExcluir">Excluir</button>
        </li>
        <br>
        `
    });
}





//04/03
//>>>>>>>>>>>>>>>>
//3º Parte do CRUD (Create, Read, Update, Delete)
//CRUD UPDATE - Alterar os dados do banco
/*
    Passo 1
    1.1 - Criar o botão editar na lista de Tarefas
    1.2 - Criar a função editarTarefa e testar no console
    1.3 - Acrescentar a diretiva unsafe-inline no index.html
    1.4 - Testar a passagem do Id como parâmetro
    1.5 - Criar 2 Variáveis de apoio para reutilização do formulario nos métodos "Adicionar" e "Editar" uma Tarefa
    a Variável status (status do update)
    idTarefa (id)
*/

//Fazendo o Passo 1.2 acima:
function editarTarefa(id) {
    //console.log("Teste do botão Editar")
    console.log(id)

    //Passo 2 (Slide) - Enviar para o HTML os dados da Tarefa para serem alterados
    updateStatus = true // Sinalizar ao Formulário que é um Update
    idTarefa = id       // Armazenar o Id da Tarefa a ser modificada
    const tarefaEditada = arrayTarefas.find(arrayTarefas => arrayTarefas._id === id)
    nomeTarefa.value = tarefaEditada.nome
    descricaoTarefa.value = tarefaEditada.descricao
}

//Passos 5 e 6 - Receber a confirmação do Update e Renderizar novamente
ipcRenderer.on('update-task-success', (event, args) => {
    console.log(args) //teste do passo 5 (Recebimento do main)

    //Renderizar a Tarefa - Passo 6 (Mapeamento do Array)
    const tarefaEditada = JSON.parse(args)
    arrayTarefasEditadas = arrayTarefas.map(t => {
        //Se id for igual a tarefa editada
        if (t._id === tarefaEditada._id) {
            t.nome = tarefaEditada.nome,
                t.descricao = tarefaEditada.descricao
        }
        return t

    })

    renderizarTarefas(arrayTarefasEditadas)
    updateStatus = false    //Sinaliza o fim do update IMPORTANTE!!!

})





//4º Passo do CRUD (Create, Read, Update, Delete)
//CRUD Delete - Deletar os dados do banco
/*
    Passo 1
    1.1 - Criar o botão excluir na lista de Tarefas
    1.2 - Criar a função excluirTarefa e testar no console
    1.3 - Acrescentar a diretiva unsafe-inline no index.html
    1.4 - Testar a passagem do Id como parâmetro
    1.5 - Criar 2 Variáveis de apoio para reutilização do formulario nos métodos "Adicionar" e "Editar" uma Tarefa
    a Variável status (status do update)
    idTarefa (id)
*/

//Passo 1.2 - DELETE
function excluirTarefa(id) {
    console.log(id) //Passo 1.3

    //Passo 2 - Confirmar a exclusao(main) -> Enviar este ao main junto com o id da Tarefa a ser excluida
    ipcRenderer.send('delete-task', id)
}

//Passo 4 Update -> Receber a confirmação de exclusão e renderizar novamente a lista de tarefas pendentes
ipcRenderer.on('delete-task-success', (event, args) => {
    console.log(args)   //Teste de recebimento dos Dados do Banco

    //Atualizar a Lista de Tarefas pendentes usando um filtro no Array para remover a Tarefa Excluída
    const tarefaEliminada = JSON.parse(args)
    const listaAtualizada = arrayTarefas.filter((t) => {
        return t._id !== tarefaEliminada._id
    })
    arrayTarefas = listaAtualizada
    renderizarTarefas(arrayTarefas)
})