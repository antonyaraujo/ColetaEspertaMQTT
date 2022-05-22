require('dotenv').config()
const mqtt = require('mqtt')

const lixeira = {
    longitude: 0.0,
    latitude: 0.0,
    capacidadeAtual: 0.0,
    capacidadeMaxima: 100.0,
    capacidade: 0.0
}

var options = {
    host: process.env.HOST,
    port: process.env.PORTA,
    protocol: process.env.PROTOCOLO,
    username: process.env.USUARIO,
    password: process.env.SENHA,
}

/** Se inscreve no tópico */
const cliente = mqtt.connect(options)
const topico = 'estacaoA'
cliente.on('connect', () => {
    console.log('Conectado ao Tópico EstacaoA')
    cliente.subscribe([topico], () => {
      console.log(`Lixeira inscrita no tópico: '${topico}'`)
    })
  })

/** Envia os dados atuais da lixeira para o tópico em caso de alteração */
function enviarDados(){
    lixeiraString = JSON.stringify(lixeira)
    
    cliente.on('connect', () => {
        cliente.publish('estacaoA', lixeiraString, { qos: 0, retain: false }, (error) => {
          if (error) {
            console.error(error)
          }
        })
    })

    console.log(JSON.stringify(lixeira))
}

/** Recebe uma nova capacidadeAtual para a lixeira */
function alterarCapacidade(operacao, quantidade){
    if(operacao == 'adicionar'){
        novaCapacidade = lixeira.capacidadeAtual + quantidade
        if(novaCapacidade > lixeira.capacidadeMaxima)
            console.log("Não foi possível adicionar mais lixo pois a capacidade já está cheia!")
        else{
            lixeira.capacidadeAtual = novaCapacidade;            
            lixeira.capacidade = (lixeira.capacidadeAtual/lixeira.capacidadeMaxima)*100;
            enviarDados();
        }
    } else {
        novaCapacidade = lixeira.capacidadeAtual - quantidade
        if(novaCapacidade < 0)
            console.log("Não há mais lixo para ser removido!")
        else{
            lixeira.capacidadeAtual = novaCapacidade;            
            lixeira.capacidade = (lixeira.capacidadeAtual/lixeira.capacidadeMaxima)*100;
            enviarDados();
        }
    }
}

cliente.on('message', (topic, payload) => {
    dados = JSON.parse(payload.toString());    
    alterarCapacidade(dados.operacao, dados.quantidade);    
    //console.log('Received Message:', topic, payload.toString())
  })