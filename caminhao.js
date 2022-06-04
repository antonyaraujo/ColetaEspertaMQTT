require('dotenv').config()
const mqtt = require('mqtt')

const lixeiras = []

var options = {
    host: process.env.HOST,
    port: process.env.PORTA,
    protocol: process.env.PROTOCOLO,
    username: process.env.USUARIO,
    password: process.env.SENHA,
}


/** Estacao A 
 * Se inscreve no tópico */
const cliente = mqtt.connect(options)
const topico = ['estacaoA/#', 'estacaoB/#', 'estacaoC/#'];
cliente.on('connect', () => {
    console.log('Conectado ao Tópico EstacaoA')
    cliente.subscribe([topico], () => {
      console.log(`Estacao inscrita no tópico: '${topico}'`)
    })
  })

function atualizarLixeira(valores){
  encontrado = false;
  lixeiras.forEach(function(lixeira, i){
    if(lixeira.codigo == valores.codigo){
      lixeira.ocupacaoAtual = valores.ocupacaoAtual
      encontrado = true
      return true
    }
  })

  if(!encontrado){    
    lixeiras.push({"codigo": valores.codigo, "ocupacaoAtual": valores.ocupacaoAtual});    
  }
  console.log(lixeiras)
}

/** Alteracao no topico ou subtopicos */
cliente.on('message', (topico, payload) => {  
  dados = JSON.parse(payload.toString());   
  atualizarLixeira(dados)
})

/**Enviar dados */
function enviarDados(lixeira){                        
    topicoLixeira = 'estacao'+lixeira.estacao+'/esvaziar_lixeira'
    console.log(topicoLixeira)   
    console.log(lixeira.codigo)
    cliente.publish(topicoLixeira, 'codigo: ' + lixeira.codigo, { qos: 0, retain: false }, (error) => {
        if (error) {
        console.error(error)
        }
    })        
    console.log("Lixeira " + lixeira.codigo + "recolhida");
  }

  /** Automatização */
  setInterval(() => {    
    lixeiras.sort(function(a,b) {
        if(a.opcapacaoAtual < b.ocupacaoAtual) return -1;
        if(a.ocupacaoAtual > b.ocupacaoAtual) return 1;
        return 0;
    });
    console.log("Recolhendo lixeira: " + lixeiras.find(0).codigo + "Da estação " + lixeiras.find(0).estacao);
    
    
  }, 5000);