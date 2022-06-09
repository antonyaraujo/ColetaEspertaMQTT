const prompto = require("prompt-sync")();
const http = require("http");
const inquirer = require("inquirer");
import axios from "axios";
import { Lixeira } from "lixeira";
const promises: any[] = [];
let lastData: any = [];
async function visualizarLixeiras(estacao: string, quantidade: number) {
  let requisicao: string;
  if (estacao === "Todas") {
    requisicao = `http://localhost:4000/Lixeiras_${quantidade}`;
  } else {
    requisicao = `http://localhost:4000/Estacao${estacao}/Lixeiras_${quantidade}`;
  }

  const request = axios.get(requisicao).then(function (response) {
    lastData = response.data;
    lastData.forEach((lixeira: Lixeira) => {
      console.log(`Lixeira ${lixeira.id}`);
    });
  });
  promises.push(request);
  await Promise.all(promises);
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
      visualizarLixeiras(estacao, quantidade).then(() => {
        visualizarLixeira(lastData);
      });
    });
};

const visualizarLixeira = (lixeiras: Lixeira[]) => {
  let aux: string[] = [];
  // console.log(lixeiras);
  lixeiras.forEach((lixeira: Lixeira) => {
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
        exibirMenu();
      });
    });
};

exibirMenu();
