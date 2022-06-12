const prompto = require("prompt-sync")();
const http = require("http");
const inquirer = require("inquirer");
import axios from "axios";
import { Lixeira } from "lixeira";
const promises: any[] = [];
let lixeiras: any[] = [];
let lixeirasRequisicao: Lixeira[] = [];

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
  })
  .catch(error => console.log("o erro foi: " + error.message));
  promises.push(request);
  await Promise.all(promises);
}

async function visualizarLixeiras(quantidade: number) {
  let requisicao: string;
  let porta = 4000;
  for (let i: number = 0; i <= 1; i++) {
    porta += i;    
    console.log("Requisitando na porta ", porta);
    requisicao = `http://localhost:${porta}/Lixeiras_${quantidade}`;    
    console.log("Requisição: ", requisicao);
    /** Requisição da Estação */
    const request = await axios.get(requisicao).then(function (response) {
      console.log(response.data);
      lixeirasRequisicao = lixeirasRequisicao.concat(response.data);
      console.log(lixeirasRequisicao);
      console.log(`Exibição - ${i + 1} requisição`);
      lixeirasRequisicao.forEach((lixeira: any) => {
        console.log(`Lixeira ${lixeira.id}`);
      });
      
      
    });
    try{
      promises.push(request);
      Promise.all(promises);
    }catch{
      console.log("POssível erro 404");
    }
  }

    // Ordenacao das lixeiras
    if (lixeirasRequisicao.length == 0) {
      console.log("Não há lixeiras para serem coletadas no momento.");
    } else {
      lixeiras.sort(function (a: any, b: any) {
        //Ordena as lixeiras
        if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
        if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
        return 0;
      });
    }

    lixeirasRequisicao = lixeirasRequisicao.slice(0, quantidade); 
}

async function visualizarLixeiraEspecifica(porta: number, id: string) {  
  const requisicao = `http://localhost:${porta}/Lixeiras/${id}`;
  console.log(requisicao)
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
          visualizarLixeira(lixeirasRequisicao);
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
  let porta: number = 4000;
  // console.log(lixeiras);
  console.log(lixeirasResponse)
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
        lixeirasResponse.forEach((lixeira: Lixeira) => {
            if(lixeira.id === answers.id){
              switch(lixeira.estacao){
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
            };
        })        
        visualizarLixeiraEspecifica(porta, answers.id).then(() => {
        lixeiras = [];
        exibirMenu();
      });
    });
    lixeirasRequisicao = [];
};

exibirMenu();
