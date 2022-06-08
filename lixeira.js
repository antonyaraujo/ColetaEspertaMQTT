require("dotenv").config();
const mqtt = require("mqtt");
const lixeira = {
    codigo: 1,
    longitude: 0.0,
    latitude: 0.0,
    capacidadeAtual: 0.0,
    capacidadeMaxima: 100.0,
    ocupacaoAtual: 0.0,
    estacao: "B",
};
let options = {
    host: process.env.HOST,
    port: process.env.PORTA,
    protocol: process.env.PROTOCOLO,
    username: process.env.USUARIO,
    password: process.env.SENHA,
    clientID: `Lixeira ${lixeira.codigo}`,
};
/** Se inscreve no tópico */
const cliente = mqtt.connect(options);
const topicoInscrito = `estacao${lixeira.estacao}/esvaziar_lixeira`;
const topicoPublicar = `estacao${lixeira.estacao}/Lixeira` + lixeira.codigo;
cliente.on("connect", () => {
    cliente.subscribe([topicoInscrito], () => {
        console.log(`Lixeira inscrita no tópico: '${topicoInscrito}'`);
    });
});
/**Enviar dados */
function enviarDados() {
    console.log(topicoPublicar);
    console.log(lixeira.ocupacaoAtual);
    const lixeiraString = JSON.stringify(lixeira);
    cliente.publish(topicoPublicar, lixeiraString, { qos: 0, retain: false }, (error) => {
        if (error) {
            console.error("Error on publish:" + error);
        }
    });
    console.log(`Publicou ${lixeira.ocupacaoAtual}`);
}
/** Recebe dados do topico inscrito*/
cliente.on("message", (payload) => {
    const dados = JSON.parse(payload.toString());
    if (dados.codigo === lixeira.codigo) {
        // A lixeira recebe a mensagem para ser esvaziada.
        lixeira.capacidadeAtual = 0;
        lixeira.ocupacaoAtual = 0;
        enviarDados();
        console.log(`Lixeira ${lixeira.codigo} esvaziada!`);
    }
});
let avisarOcupacao = 0; //Caso a lixeira já esteja cheia, ele só irá enviar seus dados a cada 25 segs.
function adicionarLixo(quantidade) {
    const novaCapacidadeAtual = lixeira.capacidadeAtual + quantidade;
    if (novaCapacidadeAtual >= lixeira.capacidadeMaxima) {
        console.log("A quantidade ultrapassa a capacidade máxima da lixeira");
        avisarOcupacao++;
        if (avisarOcupacao === 5) {
            enviarDados();
            avisarOcupacao = 0;
        }
    }
    else {
        lixeira.capacidadeAtual = novaCapacidadeAtual;
        lixeira.ocupacaoAtual =
            (lixeira.capacidadeAtual / lixeira.capacidadeMaxima) * 100;
        enviarDados();
    }
}
/** Automatização - a cada 5s uma quantidade de lixo é adicionada*/
setInterval(() => {
    const quantidade = Math.trunc(Math.random() * (10 - 1));
    console.log(`Lixeira ${lixeira.codigo} adicionando ${quantidade} m³ de lixo...`);
    adicionarLixo(quantidade);
}, 5000);
