require("dotenv").config();
const mqtt = require("mqtt");
import { Lixeira } from "./lixeira";

import express from "express";
import cors from "cors";

// Porta do servidor
const PORT = process.env.PORT || 4000;
// Host do servidor
const HOSTNAME = process.env.HOSTNAME || "http://localhost";
// App Express
const app = express();

// Endpoint raiz
app.get("/", (req, res) => {
  res.send("Bem-vindo!");
});
// Cors
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

let lixeiras: Lixeira[] = [];

const desc = (a: Lixeira, b: Lixeira) => {
  //Ordena as lixeiras da mais cheia pra menos cheia
  if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
  if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
  return 0;
};

// Rotas
app.get("/Lixeiras_:N", (req, res) => {
  const numeroLixeiras: number = +req.params["N"];
  console.log(numeroLixeiras);
  lixeiras.sort(desc);
  lixeiras = lixeiras.slice(0, numeroLixeiras);
  res.send(lixeiras);
});

app.get("/Estacao:id/Lixeiras_:N", (req, res) => {
  const numeroLixeiras: number = +req.params["N"];
  const estacao: string = req.params["id"];
  let lixeirasSelecionadas: Lixeira[] = [];
  lixeiras.forEach((lixeira) => {
    if (lixeira.estacao === estacao) {
      lixeirasSelecionadas.push(lixeira);
    }
  });

  lixeirasSelecionadas.sort(desc);
  lixeirasSelecionadas = lixeirasSelecionadas.slice(0, numeroLixeiras);
  res.send(lixeirasSelecionadas);
});

app.get("/Lixeiras/:id", (req, res) => {
  const id: string = req.params["id"];
  lixeiras.forEach((lixeira: Lixeira) => {
    if (lixeira.id === id) {
      res.send(lixeira);
    } else {
      res.sendStatus(404);
    }
  });
});

// Inicia o sevidor
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso ${HOSTNAME}:${PORT}`);
});

const options = {
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

function atualizarLixeira(dadosLixeira: Lixeira) {
  let encontrado = false;
  lixeiras.forEach(function (lixeira, i) {
    if (lixeira.id == dadosLixeira.id) {
      lixeira.ocupacaoAtual = dadosLixeira.ocupacaoAtual;
      lixeira.quantidadeLixoAtual = dadosLixeira.quantidadeLixoAtual;
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
cliente.on("message", (topico: any, payload: any) => {
  const dados = JSON.parse(payload.toString());
  atualizarLixeira(dados);
});
