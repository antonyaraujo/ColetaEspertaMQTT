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
  clientID: `Caminhao`,
};

/** Estacao A
 * Se inscreve no tópico */
const cliente = mqtt.connect(options);
const topico = ["estacaoA/#", "estacaoB/#", "estacaoC/#"];
cliente.on("connect", () => {
  console.log("Conectado às estações A, B e C");
  cliente.subscribe(topico, () => {
    console.log(`Caminhão inscrito no tópico: '${topico}'`);
  });
});

//** Recebe os dados atualizados das lixeiras*/
function atualizarLixeira(dadosLixeiras: Lixeira) {
  let encontrado = false;
  lixeiras.forEach((lixeira) => {
    if (lixeira.id == dadosLixeiras.id) {
      lixeira.ocupacaoAtual = dadosLixeiras.ocupacaoAtual;
      lixeira.estacao = dadosLixeiras.estacao;
      encontrado = true;
      return true;
    }
  });

  // Lixeira nova! Deve ser adiciona a lista.
  if (!encontrado) {
    lixeiras.push({ ...dadosLixeiras });
  }
  console.log(lixeiras);
}

/** Alteracao no topico ou subtopicos */
cliente.on("message", (payload: { toString: () => string }) => {
  console.log(payload.toString);
  const dados: Lixeira = JSON.parse(payload.toString());
  atualizarLixeira(dados);
});

/**Enviar dados */
function coletarLixeira(lixeira: Lixeira) {
  const topicoLixeira = "estacao" + lixeira.estacao + "/esvaziar_lixeira";
  console.log(topicoLixeira);
  console.log(lixeira.id);

  cliente.publish(
    topicoLixeira,
    JSON.stringify({ id: lixeira.id }),
    { qos: 0, retain: false },
    (error: any) => {
      if (error) {
        console.error(error);
      }
    }
  );
  console.log("Lixeira " + lixeira.id + "recolhida");
}

/** A cada 10s o caminhão parte para coletar a próxima lixeira.*/
setInterval(() => {
  if (lixeiras.length == 0) {
    console.log("Não há lixeiras para serem coletadas no momento.");
  } else {
    console.log(JSON.stringify(lixeiras));
    lixeiras.sort(function (a, b) {
      //Ordena as lixeiras
      if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
      if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
      return 0;
    });
    // console.log(
    //   "Recolhendo lixeira: " +
    //     lixeiras[0]id +
    //     "Da estação " +
    //     lixeiras[0].estacao
    // );
    console.log(`Caminhão se encaminhando para a lixeira ${lixeiras[0].id}`);
    coletarLixeira(lixeiras[0]);
  }
}, 1000 * 10);

export {};
