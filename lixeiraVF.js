require('dotenv').config()
const mqtt = require('mqtt')

const lixeira = {
    codigo: 2,
    longitude: 0.0,
    latitude: 0.0,
    capacidadeAtual: 0.0,
    capacidadeMaxima: 100.0,
    ocupacaoAtual: 0.0, // dado em porcentagem (%)
    estacao: 'B',
}

var configuracaoRecebimento = {
    host: process.env.HOST,
    port: process.env.PORTA,
    protocol: process.env.PROTOCOLO,
    username: process.env.USUARIO,
    password: process.env.SENHA,
}

/** Se inscreve no tópico */
const cliente = mqtt.connect(configuracaoRecebimento)
const topico = 'estacaoB/esvaziar_lixeira'
cliente.on('connect', () => {
    console.log('Conectado ao Tópico EstacaoA')
    cliente.subscribe([topico], () => {
      console.log(`Lixeira inscrita no tópico: '${topico}'`)
    })
  })

/**Enviar dados */
function enviarDados(){                        
        topicoLixeira = 'estacaoB/Lixeira'+lixeira.codigo
        console.log(topicoLixeira)
        console.log(lixeira.ocupacaoAtual)
        lixeiraString = JSON.stringify(lixeira)
        cliente.publish(topicoLixeira, lixeiraString, { qos: 0, retain: false }, (error) => {
            if (error) {
            console.error(error)
            }
        })        
        console.log("publicou a ocupacaoAtual tal:" + lixeira.ocupacaoAtual)        
      }

/** Recebe dados do topico inscrito*/
cliente.on('message', (topic, payload) => {
    dados = JSON.parse(payload.toString());           
    if(dados.codigo == lixeira.codigo){
        lixeira.capacidadeAtual = 0
        lixeira.ocupacaoAtual = 0
        enviarDados()
        console.log("Lixeira " + lixeira.codigo + " esvaziada!!")
    }    
  })

  function adicionarLixo(quantidade) {
         novaCapacidadeAtual = lixeira.capacidadeAtual + quantidade;
         if (novaCapacidadeAtual > lixeira.capacidadeMaxima)
            console.log("A quantidade ultrapassa a capacidade maxima da lixeira")
         else {
             lixeira.capacidadeAtual = novaCapacidadeAtual;
             lixeira.ocupacaoAtual = (lixeira.capacidadeAtual / lixeira.capacidadeMaxima) * 100;
             enviarDados();
         }   
  }

  /** Automatização */
  setInterval(() => {    
    quantidade = Math.random() * 100.0;
    console.log("Adicionando " + quantidade + " em lixo...");
    adicionarLixo(quantidade);
  }, 5000);