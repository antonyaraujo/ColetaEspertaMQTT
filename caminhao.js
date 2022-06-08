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
function atualizarLixeira(dadosLixeiras) {
    let encontrado = false;
    lixeiras.forEach((lixeira) => {
        if (lixeira.codigo == dadosLixeiras.codigo) {
            lixeira.ocupacaoAtual = dadosLixeiras.ocupacaoAtual;
            lixeira.estacao = dadosLixeiras.estacao;
            encontrado = true;
            return true;
        }
    });
    // Lixeira nova! Deve ser adiciona a lista.
    if (!encontrado) {
        lixeiras.push(Object.assign({}, dadosLixeiras));
    }
    console.log(lixeiras);
}
/** Alteracao no topico ou subtopicos */
cliente.on("message", (topico, payload) => {
    console.log(payload.toString);
    const dados = JSON.parse(payload.toString());
    atualizarLixeira(dados);
});
/**Enviar dados */
function coletarLixeira(lixeira) {
    const topicoLixeira = "estacao" + lixeira.estacao + "/esvaziar_lixeira";
    console.log(topicoLixeira);
    console.log(lixeira.codigo);
    cliente.publish(topicoLixeira, JSON.stringify({ codigo: lixeira.codigo }), { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error(error);
        }
    });
    console.log("Lixeira " + lixeira.codigo + "recolhida");
}
/** A cada 10s o caminhão parte para coletar a próxima lixeira.*/
setInterval(() => {
    if (lixeiras.length == 0) {
        console.log("Não há lixeiras para serem coletadas no momento.");
    }
    else {
        console.log(JSON.stringify(lixeiras));
        lixeiras.sort(function (a, b) {
            //Ordena as lixeiras
            if (a.ocupacaoAtual > b.ocupacaoAtual)
                return -1;
            if (a.ocupacaoAtual < b.ocupacaoAtual)
                return 1;
            return 0;
        });
        // console.log(
        //   "Recolhendo lixeira: " +
        //     lixeiras[0]codigo +
        //     "Da estação " +
        //     lixeiras[0].estacao
        // );
        console.log(`Caminhão se encaminhando para a lixeira ${lixeiras[0].codigo}`);
        coletarLixeira(lixeiras[0]);
    }
}, 1000 * 10);
