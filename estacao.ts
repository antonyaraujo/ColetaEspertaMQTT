require("dotenv").config();
const mqtt = require("mqtt");
import { Lixeira } from "./lixeira";

import express from "express";
import cors from "cors";

// // Porta do servidor
// const PORT = process.env.PORT || 4000;
// // Host do servidor
// const HOSTNAME = process.env.HOSTNAME || "http://localhost";
// // App Express
// const app = express();

// // Endpoint raiz
// app.get("/", (req, res) => {
//   res.send("Bem-vindo!");
// });
// // Cors
// app.use(
//   cors({
//     origin: ["http://localhost:3000"],
//   })
// );

let lixeiras: Lixeira[] = [];

// const desc = (a: Lixeira, b: Lixeira) => {
//   //Ordena as lixeiras da mais cheia pra menos cheia
//   if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
//   if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
//   return 0;
// };

// // Rotas
// app.get("/Lixeiras:N", (req, res) => {
//   const numeroLixeiras: number = +req.params["N"];
//   lixeiras.sort(desc);
//   lixeiras = lixeiras.slice(0, numeroLixeiras);
//   res.send(lixeiras);
// });

// app.get("/Lixeiras/:id", (req, res) => {
//   const id: string = req.params["id"];
//   lixeiras.forEach((lixeira: Lixeira) => {
//     if (lixeira.id === id) {
//       res.send(lixeira);
//     } else {
//       res.sendStatus(404);
//     }
//   });
// });

// // Inicia o sevidor
// app.listen(PORT, () => {
//   console.log(`Servidor rodando com sucesso ${HOSTNAME}:${PORT}`);
// });

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
cliente.on("message", (payload: any) => {
  console.log(payload);
  const dados: Lixeira = JSON.parse(payload.toString());
  atualizarLixeira(dados);
});
