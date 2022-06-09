const prompto = require('prompt-sync')();
const http = require('http');
import axios from 'axios';
const promises: any[] = [];

async function visualizarLixeiras(estacao:string, quantidade:number){              
         
const request = axios.get('http://localhost:4000/Lixeiras/get/'+quantidade)
  .then(function (response) {
    console.log(response.data);    
  })
  promises.push(request);
  await Promise.all(promises)
}

let opcao: number = 0;
do{
    console.log("Informe a opcao que deseja realizar: " +
    "\n [1] - Visualizar lixeiras mais críticas" + 
    "\n [0] - Sair");
    let leitor = prompto("--> ", "0")
    opcao = parseInt(leitor, 10);
    if(opcao === 1){
        let estacao:number = 4
        console.log("Informe em qual estação buscar: " + 
        "\n [1] Estação A" + 
        "\n [2] Estação B" + 
        "\n [3] Estação C" + 
        "\n [4] Todas" 
        );
        leitor = prompto("--> ", "0")
        estacao = parseInt(leitor, 10);
        console.log("Informe a quantidade de lixeiras a visualizar");
        let leitorB = prompto("--> ", "0")
        let quantidade:number = parseInt(leitorB, 10);
        switch(estacao){
            case 1: 
            visualizarLixeiras("estacaoA", quantidade);
            break;
            case 2:
                console.log("entrou no 1o switch")            
                visualizarLixeiras("estacaoB", quantidade);
            break;
        }
    }
}while(opcao != 0)