require("dotenv").config();
const mqtt = require("mqtt");

export interface Lixeira {
  id: string;
  longitude: number;
  latitude: number;
  quantidadeLixoAtual: number;
  quantidadeLixoMaxima: number;
  ocupacaoAtual: number; // dado em porcentagem (%)
  estacao: "A" | "B" | "c";
}

const lixeira: Lixeira = {
  id: Date.now().toString(36), //Gera um ID único
  longitude: 0.0,
  latitude: 0.0,
  quantidadeLixoAtual: 0.0,
  quantidadeLixoMaxima: 100.0,
  ocupacaoAtual: 0.0,
  estacao: "B",
};

let options = {
  host: process.env.HOST,
  port: process.env.PORTA,
  protocol: process.env.PROTOCOLO,
  username: process.env.USUARIO,
  password: process.env.SENHA,
};

/** Se inscreve no tópico */
const cliente = mqtt.connect(options);
const topicoInscrito = `estacao${lixeira.estacao}/esvaziar_lixeira`;
const topicoPublicarDados = `estacao${lixeira.estacao}/Lixeira` + lixeira.id;
const topicoPublicarSaida = `estacao${lixeira.estacao}/Lixeira` + lixeira.id;

cliente.on("connect", () => {
  cliente.subscribe([topicoInscrito], () => {
    console.log(`Lixeira inscrita no tópico: '${topicoInscrito}'`);
  });
});

/**Enviar dados */
function enviarDados() {
  const lixeiraString = JSON.stringify(lixeira);
  cliente.publish(
    topicoPublicarDados,
    lixeiraString,
    { qos: 0, retain: false },
    (error: string) => {
      if (error) {
        console.error("Error on publish:" + error);
      }
    }
  );
  console.log(
    `Lixeria ${lixeira.id} publicou a quantidade de lixo: ${lixeira.quantidadeLixoAtual}. ${lixeira.ocupacaoAtual}% utilizada`
  );
}

/** Recebe dados do topico inscrito*/
cliente.on("message", (topico: any, payload: { toString: () => string }) => {
  const dados = JSON.parse(payload.toString());
  if (dados.id === lixeira.id) {
    // A lixeira recebe a mensagem para ser esvaziada.
    lixeira.quantidadeLixoAtual = 0;
    lixeira.ocupacaoAtual = 0;
    enviarDados();
    console.log(`Lixeira ${lixeira.id} esvaziada!`);
  }
});

let avisarOcupacao = 0; //Caso a lixeira já esteja cheia, ele só irá enviar seus dados a cada 25 segs.

function adicionarquantidadeLixoAtual(quantidade: number) {
  const novoquantidadeLixoAtual = lixeira.quantidadeLixoAtual + quantidade;
  if (novoquantidadeLixoAtual > lixeira.quantidadeLixoMaxima) {
    console.log("A quantidade ultrapassa a capacidade máxima da lixeira");
    avisarOcupacao++;
    if (avisarOcupacao === 5) {
      enviarDados();
      avisarOcupacao = 0;
    }
  } else {
    lixeira.quantidadeLixoAtual = novoquantidadeLixoAtual;
    lixeira.ocupacaoAtual = Math.trunc(
      (lixeira.quantidadeLixoAtual / lixeira.quantidadeLixoMaxima) * 100
    );
    enviarDados();
  }
}

/** Automatização - a cada 5s uma quantidade de quantidadeLixoAtual é adicionada*/

setInterval(() => {
  const quantidade = Math.trunc(Math.random() * (10 - 1));
  console.log(
    `Lixeira ${lixeira.id} adicionando ${quantidade} m³ de quantidadeLixoAtual...`
  );
  adicionarquantidadeLixoAtual(quantidade);
}, 5000);

process.on("SIGINT", function () {
  console.log("Caught interrupt signal");
  cliente.publish(
    topicoPublicarDados,
    { qos: 0, retain: false },
    (error: string) => {
      if (error) {
        console.error("Error on publish:" + error);
      }
    }
  );

  process.exit(0);
});
