require("dotenv").config();
const mqtt = require("mqtt");

const lixeiras = [];

let options = {
  host: process.env.HOST,
  port: process.env.PORTA,
  protocol: process.env.PROTOCOLO,
  username: process.env.USUARIO,
  password: process.env.SENHA,
  clientID: `Caminhao`,
};

/** Estacao A
 * Se inscreve no tópico */
const cliente = mqtt.connect(options);
const topico = ["estacaoA/#", "estacaoB/#", "estacaoC/#"];
cliente.on("connect", () => {
  console.log("Conectado ao Tópico EstacaoA");
  cliente.subscribe(topico, () => {
    console.log(`Estacao inscrita no tópico: '${topico}'`);
  });
});

function atualizarLixeira(valores) {
  let encontrado = false;
  lixeiras.forEach((lixeira) => {
    if (lixeira.codigo == valores.codigo) {
      lixeira.ocupacaoAtual = valores.ocupacaoAtual;
      lixeira.estacao = valores.estacao;
      encontrado = true;
      return true;
    }
  });

  if (!encontrado) {
    lixeiras.push({
      codigo: valores.codigo,
      ocupacaoAtual: valores.ocupacaoAtual,
      estacao: valores.estacao,
    });
  }
  console.log(lixeiras);
}

/** Alteracao no topico ou subtopicos */
cliente.on("message", (topico, payload) => {
  const dados = JSON.parse(payload.toString());
  console.log(dados);
  atualizarLixeira(dados);
});

/**Enviar dados */
function enviarDados(lixeira) {
  const topicoLixeira = "estacao" + lixeira.estacao + "/esvaziar_lixeira";
  console.log(topicoLixeira);
  console.log(lixeira.codigo);
  cliente.publish(
    topicoLixeira,
    "codigo: " + lixeira.codigo,
    { qos: 0, retain: false },
    (error) => {
      if (error) {
        console.error(error);
      }
    }
  );
  console.log("Lixeira " + lixeira.codigo + "recolhida");
}

/** Automatização */
setInterval(() => {
  if (lixeiras != null) {
    lixeiras.sort(function (a, b) {
      //Ordena as lixeiras
      if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
      if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
      return 0;
    });
    console.log(lixeiras);
    // console.log(
    //   "Recolhendo lixeira: " +
    //     lixeiras[0]codigo +
    //     "Da estação " +
    //     lixeiras[0].estacao
    // );
    console.log(typeof lixeiras[0]);
    enviarDados(lixeiras[0]);
  }
}, 5000);
