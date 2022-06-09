const prompto = require("prompt-sync")();
const http = require("http");
const inquirer = require("inquirer");
import axios from "axios";
import { Lixeira } from "lixeira";
const promises: any[] = [];
let lixeiras: any[] = [];

async function visualizarLixeirasEstacao(estacao: string, quantidade: number) {
  let requisicao: string;
  let porta;

  switch (estacao) {
    case "A":
      porta = 4000;
      break;
    case "B":
      porta = 4001;
      break;
    case "C":
      porta = 4002;
      break;
  }

  requisicao = `http://localhost:${porta}/Lixeiras_${quantidade}`;
  console.log(requisicao);
  /** Requisição da Estação */
  const request = axios.get(requisicao).then(function (response) {
    lixeiras = lixeiras.concat(response.data);
    console.log(lixeiras);
    lixeiras.forEach((lixeira: any) => {
      console.log(`Lixeira ${lixeira.id}`);
    });
  });
  promises.push(request);
  await Promise.all(promises);
}

async function visualizarLixeiras(quantidade: number) {
  let requisicao: string;
  let porta = 4000;
  for (let i: number = 0; i < 1; i++) {
    porta += i;
    requisicao = `http://localhost:${porta}/Lixeiras_${quantidade}`;
    console.log(requisicao);
    /** Requisição da Estação */
    const request = axios.get(requisicao).then(function (response) {
      lixeiras = lixeiras.concat(response.data);
      console.log(lixeiras);
      console.log(`Exibição - ${i + 1} requisição`);
      lixeiras.forEach((lixeira: any) => {
        console.log(`Lixeira ${lixeira.id}`);
      });
    });

    // Ordenacao das lixeiras
    if (lixeiras.length == 0) {
      console.log("Não há lixeiras para serem coletadas no momento.");
    } else {
      lixeiras.sort(function (a: any, b: any) {
        //Ordena as lixeiras
        if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
        if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
        return 0;
      });
    }
    promises.push(request);
    await Promise.all(promises);
  }
}

async function visualizarLixeiraEspecifica(id: string) {
  const requisicao = `http://localhost:4000/Lixeiras/${id}`;

  const request = axios.get(requisicao).then(function (response) {
    console.log(response.data);
  });
  promises.push(request);
  await Promise.all(promises);
}

const exibirMenu = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "estacao",
        message:
          "Escolha uma estação para visualizar as lixeiras mais críticas.",
        default: "Todas",
        choices: ["A", "B", "C", "Todas"],
      },
      {
        name: "quantidade",
        message: "Informe a quantidade de lixeiras a visualizar",
      },
    ])
    .then((answers: any) => {
      // console.info("Answers:", answers);
      const estacao = answers.estacao;
      // console.log(estacao);
      const quantidade = +answers.quantidade;

      if (estacao === "Todas") {
        visualizarLixeiras(quantidade).then(() => {
          visualizarLixeira(lixeiras);
        });
      } else {
        visualizarLixeirasEstacao(estacao, quantidade).then(() => {
          visualizarLixeira(lixeiras);
        });
      }
    });
};

const visualizarLixeira = (lixeirasResponse: Lixeira[]) => {
  let aux: string[] = [];
  // console.log(lixeiras);
  lixeirasResponse.forEach((lixeira: Lixeira) => {
    aux.push(lixeira.id);
  });
  inquirer
    .prompt([
      {
        type: "list",
        name: "id",
        message: "Escolha uma lixeira para visualizar seus dados",
        choices: aux,
      },
    ])
    .then((answers: any) => {
      // console.info("Answers:", answers);
      visualizarLixeiraEspecifica(answers.id).then(() => {
        lixeiras = [];
        exibirMenu();
      });
    });
};

exibirMenu();
