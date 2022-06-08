"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const mqtt = require("mqtt");
const lixeiras = [];
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
function atualizarLixeira(dadosLixeira) {
    let encontrado = false;
    lixeiras.forEach(function (lixeira, i) {
        if (lixeira.codigo == dadosLixeira.codigo) {
            lixeira.ocupacaoAtual = dadosLixeira.ocupacaoAtual;
            encontrado = true;
            return true;
        }
    });
    if (!encontrado) {
        lixeiras.push(Object.assign({}, dadosLixeira));
    }
    console.log(lixeiras);
}
/** Alteracao no topico ou subtopicos */
cliente.on("message", (topico, payload) => {
    const dados = JSON.parse(payload.toString());
    atualizarLixeira(dados);
});
