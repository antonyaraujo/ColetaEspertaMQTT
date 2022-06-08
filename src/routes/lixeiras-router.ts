import express from "express";
import Lixeira from "../models/lixeira";

// node's built in file system helper library here
const fs = require("fs");

const dataPath = "data/lixeiras.json";

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

    data[id] = lixeira;

    writeFile(JSON.stringify(data, null, 2), () => {
      res.sendStatus(404).send(data);
    });
  }, true);
});

LixeirasRouter.get("/Lixeiras", (req, res) => {
  readFile((data) => {
    res.send(data);
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

export default LixeirasRouter;
