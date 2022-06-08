require("dotenv").config();
const mqtt = require("mqtt");
import { Lixeira } from "./lixeira";
import { Lixeiras } from "./lixeira";

const lixeiras: Lixeiras = [];

const options = {
  host: process.env.HOST,
  port: process.env.PORTA,
  protocol: process.env.PROTOCOLO,
  username: process.env.USUARIO,
  password: process.env.SENHA,
  clientID: `Estacao`,
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

function atualizarLixeira(dadosLixeira: Lixeira) {
  let encontrado = false;
  lixeiras.forEach(function (lixeira, i) {
    if (lixeira.id == dadosLixeira.id) {
      lixeira.ocupacaoAtual = dadosLixeira.ocupacaoAtual;
      encontrado = true;
      return true;
    }
  });

  if (!encontrado) {
    lixeiras.push({ ...dadosLixeira });
  }
  console.log(lixeiras);
}

/** Alteracao no topico ou subtopicos */
cliente.on("message", (payload: { toString: () => string }) => {
  const dados: Lixeira = JSON.parse(payload.toString());
  atualizarLixeira(dados);
});

export {};
