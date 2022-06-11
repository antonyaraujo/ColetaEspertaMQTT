require("dotenv").config();
const mqtt = require("mqtt");
import { Lixeira } from "./lixeira";

let lixeiras: Lixeira[] = [];

/** Broker A */
const opcoesBrokerA = {
  host: "55e424c995d945808dcb66224696fd04.s1.eu.hivemq.cloud",
  port: process.env.PORTA,
  protocol: process.env.PROTOCOLO,
  username: process.env.USUARIO,
  password: process.env.SENHA,
  clientID: `Caminhao`,
};

/** Estacao A
 * Se inscreve no tópico */
const clienteA = mqtt.connect(opcoesBrokerA);
const topicoA = ["estacaoA/#"];
clienteA.on("connect", () => {
  console.log("Conectado à estação A");
  clienteA.subscribe(topicoA, () => {
    console.log(`Caminhão inscrito no tópico: '${topicoA}'`);
  });
});


/** Broker B */
const opcoesBrokerB = {
  host: "ba0157fae8534f45b495084d8235d6e2.s1.eu.hivemq.cloud",
  port: process.env.PORTA,
  protocol: process.env.PROTOCOLO,
  username: process.env.USUARIO,
  password: process.env.SENHA,
  clientID: `Caminhao`,
};

/** Estacao B
 * Se inscreve no tópico */
const clienteB = mqtt.connect(opcoesBrokerB);
const topicoB = ["estacaoB/#"];
clienteB.on("connect", () => {
  console.log("Conectado à estação B");
  clienteB.subscribe(topicoB, () => {
    console.log(`Caminhão inscrito no tópico: '${topicoB}'`);
  });
});

//** Recebe os dados atualizados das lixeiras*/
function atualizarLixeira(dadosLixeiras: Lixeira) {
  let encontrado = false;
  lixeiras.forEach((lixeira) => {
    if (lixeira.id == dadosLixeiras.id) {
      lixeira.quantidadeLixoAtual = dadosLixeiras.quantidadeLixoAtual;
      lixeira.ocupacaoAtual = dadosLixeiras.ocupacaoAtual;
      encontrado = true;
      return true;
    }
  });

  // Lixeira nova! Deve ser adiciona a lista.
  if (!encontrado) {
    lixeiras.push({ ...dadosLixeiras });
  }
}

/** Alteracao no topico ou subtopicos - Broker A */
clienteA.on("message", (topicoA: any, payload: { toString: () => string }) => {
  const dados: Lixeira = JSON.parse(payload.toString());
  atualizarLixeira(dados);
});

/** Alteracao no topico ou subtopicos - Broker B */
clienteB.on("message", (topicoB: any, payload: { toString: () => string }) => {
  const dados: Lixeira = JSON.parse(payload.toString());
  atualizarLixeira(dados);
});

/**Enviar dados */
function coletarLixeira(lixeira: Lixeira) {
  const topicoLixeira = "estacao" + lixeira.estacao + "/esvaziar_lixeira";

  clienteA.publish(
    topicoLixeira,
    JSON.stringify({ id: lixeira.id }),
    { qos: 0, retain: false },
    (error: any) => {
      if (error) {
        console.error(error);
      }
    }
  );

  clienteB.publish(
    topicoLixeira,
    JSON.stringify({ id: lixeira.id }),
    { qos: 0, retain: false },
    (error: any) => {
      if (error) {
        console.error(error);
      }
    }
  );

  console.log("Lixeira " + lixeira.id + " recolhida");
  console.log("Caminhão se deslocando para a próxima lixeira...");
}

/** A cada 10s o caminhão parte para coletar a próxima lixeira.*/
setInterval(() => {
  if (lixeiras.length == 0) {
    console.log("Não há lixeiras para serem coletadas no momento.");
  } else {
    lixeiras.sort(function (a, b) {
      //Ordena as lixeiras
      if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
      if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
      return 0;
    });
    console.log(`Caminhão se aproximando da lixeira ${lixeiras[0].id}`);
    coletarLixeira(lixeiras[0]);
  }
}, 1000 * 30);
