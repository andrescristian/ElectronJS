//Inserir data no Rodapé da página
window.addEventListener('DOMContentLoaded',() =>{
    const dataAtual = document.getElementById('data').innerHTML = obterDataAtual()
})




//Função do JavaScript que pega a data do sistema
function obterDataAtual(){
    const data = new Date()
    
    //Estrutura de Dados personalizada sobre a Data
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }
return data.toLocaleDateString('pt-BR', options)
}
