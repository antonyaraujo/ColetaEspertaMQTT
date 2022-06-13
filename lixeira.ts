require("dotenv").config();
const inquirer = require("inquirer");
const mqtt = require("mqtt");
let estacoes = ["A", "B"];

export interface Lixeira {
  id: string;
  longitude: number;
  latitude: number;
  quantidadeLixoAtual: number;
  quantidadeLixoMaxima: number;
  ocupacaoAtual: number; // dado em porcentagem (%)
  estacao: string;
}

const lixeira: Lixeira = {
  id: Date.now().toString(36), //Gera um ID único
  longitude: 0.0,
  latitude: 0.0,
  quantidadeLixoAtual: 0.0,
  quantidadeLixoMaxima: 100.0,
  ocupacaoAtual: 0.0,
  estacao: estacoes[Math.floor(Math.random() * estacoes.length)],
};

let host = lixeira.estacao === "A" ? process.env.HOST : process.env.HOSTB;

let options = {
  host: host,
  port: process.env.PORTA,
  protocol: process.env.PROTOCOLO,
  username: process.env.USUARIO,
  password: process.env.SENHA,
};

/** Se inscreve no tópico */
const cliente = mqtt.connect(options);
const topicoInscrito = `estacao${lixeira.estacao}/esvaziar_lixeira`;
console.log(topicoInscrito);
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

let ritmo = 10; // A cada 10s

inquirer
  .prompt([
    {
      type: "list",
      name: "ritmo",
      message: "Escolha um ritmo para a geração de dados da lixeira.",
      default: "Médio",
      choices: ["Lento", "Normal", "Veloz"],
    },
  ])
  .then((answers: any) => {
    switch (answers.ritmo) {
      case "Lento":
        ritmo = 15;
        break;
      case "Normal":
        ritmo = 10;
        break;
      case "Veloz":
        ritmo = 5;
    }
    console.log(ritmo);
    gerarDados(ritmo);
  });

/** Automatização - a cada 5s uma quantidade de quantidadeLixoAtual é adicionada*/

const gerarDados = (ritmo: number) => {
  setInterval(() => {
    const quantidade = Math.trunc(Math.random() * (10 - 1));
    console.log(
      `Lixeira ${lixeira.id} adicionando ${quantidade} m³ de quantidadeLixoAtual...`
    );
    adicionarquantidadeLixoAtual(quantidade);
  }, ritmo * 1000);
};
