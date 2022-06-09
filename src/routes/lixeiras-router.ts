import express from "express";
import Lixeira from "../models/lixeira";

// node's built in file system helper library here
const fs = require("fs");

const dataPath = "data/lixeiras.json";

const LixeirasRouter = express.Router();

// const id = Date.now().toString(36) //Gera um ID único

const desc = (a: Lixeira, b: Lixeira) => {
  //Ordena da mais cheia pra menos
  if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
  if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
  return 0;
};

const readFile = (
  callback: (arg0: any) => void,
  returnJson = false,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.readFile(filePath, encoding, (err: any, data: string) => {
    if (err) {
      throw err;
    }

    callback(returnJson ? JSON.parse(data) : data);
  });
};

const writeFile = (
  fileData: any,
  callback: () => void,
  filePath = dataPath,
  encoding = "utf8"
) => {
  fs.writeFile(filePath, fileData, encoding, (err: any) => {
    if (err) {
      throw err;
    }

    callback();
  });
};

LixeirasRouter.post("/Lixeiras", (req, res) => {
  readFile((data) => {
    const lixeira: Lixeira = req.body;
    const id = lixeira.id;

    data[id] = lixeira;

    writeFile(JSON.stringify(data, null, 2), () => {
      res.status(404).send(data);
    });
  }, true);
});

LixeirasRouter.get("/Lixeiras", (req, res) => {
  readFile((data) => {
    res.send(data);
  }, true);
});

// Lixeiras de uma estação específica já ordenas na ordem das mais críticas primeiro.
LixeirasRouter.get("/Estacao:id/Lixeiras", (req, res) => {
  const estacao: string = req.params["id"];
  readFile((data) => {
    const lixeiras: Lixeira[] = [];
    let auxLixeira: Lixeira;
    for (let i in data) {
      auxLixeira = data[i];
      if (auxLixeira.estacao === estacao) {
        console.log(auxLixeira);
        lixeiras.push(auxLixeira);
      }
    }

    if (lixeiras.length === 0) res.sendStatus(404);
    else {
      lixeiras.sort(desc);
      res.send(lixeiras);
    }
  }, true);
});

LixeirasRouter.get("/Lixeiras/sort_by_ocupacaoAtual_:N", (req, res) => {
  // Retorna as N lixeiras mais críticas
  const numeroLixeiras: number = +req.params["N"];
  readFile((data) => {
    let sorted: Lixeira[] = [];
    for (let i in data) {
      sorted.push(data[i]);
    }
    sorted.sort(desc);
    if (numeroLixeiras === 0) {
      res.send(data);
    }
    sorted = sorted.slice(0, numeroLixeiras);
    res.send(sorted);
  }, true);
});

LixeirasRouter.get("/Lixeiras/:id", (req, res) => {
  const id: string = req.params["id"];
  readFile((data) => {
    if (id in data) {
      res.send(data[id]);
    } else {
      res.sendStatus(404);
    }
  }, true);
});

LixeirasRouter.put("/Lixeiras/:id", (req, res) => {
  const id: string = req.params["id"];
  readFile((data) => {
    if (id in data) {
      console.log(req.body);
      data[id] = req.body;
      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`Lixeira id: ${id} atualizada`);
      });
    } else {
      res.sendStatus(404); //Not found
    }
  }, true);
});

LixeirasRouter.delete("/Lixeiras/:id", (req, res) => {
  const id: string = req.params["id"];
  readFile((data) => {
    if (id in data) {
      delete data[id];
      writeFile(JSON.stringify(data, null, 2), () => {
        res.status(200).send(`Lixeira id:${id} deletada`);
      });
    } else {
      res.sendStatus(404);
    }
  }, true);
});

/**
 * Rota para ordenar tanto asc quanto desc
 */
// LixeirasRouter.get("/Lixeiras/sort_by_ocupacaoAtual_:order", (req, res) => {
//   readFile((data) => {
//     const order: string = req.params["order"];
//     let sorted: Lixeira[] = [];
//     for (let i in data) {
//       sorted.push(data[i]);
//     }

//     const asc = (a: Lixeira, b: Lixeira) => {
//       //Ordena da menos cheia para mais cheia
//       if (a.ocupacaoAtual > b.ocupacaoAtual) return -1;
//       if (a.ocupacaoAtual < b.ocupacaoAtual) return 1;
//       return 0;
//     };

//     const desc = (a: Lixeira, b: Lixeira) => {
//       //Ordena da mais cheia pra menos
//       if (a.ocupacaoAtual < b.ocupacaoAtual) return -1;
//       if (a.ocupacaoAtual > b.ocupacaoAtual) return 1;
//       return 0;
//     };

//     if (order.localeCompare("desc")) {
//       res.send(sorted.sort(desc));
//     } else if (order.localeCompare("asc")) {
//       res.send(sorted.sort(asc));
//     } else {
//       res.sendStatus(400);
//     }
//   }, true);
// });

export default LixeirasRouter;
