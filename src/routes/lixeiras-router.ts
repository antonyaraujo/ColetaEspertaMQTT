import express from "express";
import Lixeira from "../models/lixeira";

// node's built in file system helper library here
const fs = require("fs");

const dataPath = "src/data/lixeiras.json";

const LixeirasRouter = express.Router();

// const id = Date.now().toString(36) //Gera um ID único

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

    data = JSON.parse(data);

    data[id] = lixeira;

    writeFile(JSON.stringify(data, null, 2), () => {
      res.status(201).send(data);
    });
  });
});

LixeirasRouter.get("/Lixeiras", (req, res) => {
  readFile((data) => {
    res.send(data);
  }, true);
});

LixeirasRouter.get("/Lixeiras/:id", (req, res) => {
  const id: string = req.params["id"];
  readFile((data) => {
    data = JSON.parse(data);

    if (data[id]) {
    }
    res.send(data[id]);
  });
});
LixeirasRouter.put("/Lixeiras/:id", (req, res) => {
  const id: number = +req.params.id;
  res.send(`Atualiza a lixeira ${id}`);
});
LixeirasRouter.delete("/Lixeiras/:id", (req, res) => {
  const id: number = +req.params.id;
  res.send(`Apaga a lixeira ${id}`);
});
export default LixeirasRouter;
