require("dotenv").config();
const mqtt = require("mqtt");

const lixeiras = [];

let options = {
  host: process.env.HOST,
  port: process.env.PORTA,
  protocol: process.env.PROTOCOLO,
  username: process.env.USUARIO,
  password: process.env.SENHA,
};

/** Estacao A
 * Se inscreve no tópico */
const cliente = mqtt.connect(options);
const topico = "estacaoB/#";
cliente.on("connect", () => {
  console.log("Conectado ao Tópico EstacaoA");
  cliente.subscribe([topico], () => {
    console.log(`Estacao inscrita no tópico: '${topico}'`);
  });
});

function atualizarLixeira(valores) {
  encontrado = false;
  lixeiras.forEach(function (lixeira, i) {
    if (lixeira.codigo == valores.codigo) {
      lixeira.ocupacaoAtual = valores.ocupacaoAtual;
      encontrado = true;
      return true;
    }
  });

  if (!encontrado) {
    lixeiras.push({
      codigo: valores.codigo,
      ocupacaoAtual: valores.ocupacaoAtual,
    });
  }
  console.log(lixeiras);
}

/** Alteracao no topico ou subtopicos */
cliente.on("message", (topico, payload) => {
  dados = JSON.parse(payload.toString());
  atualizarLixeira(dados);
});
