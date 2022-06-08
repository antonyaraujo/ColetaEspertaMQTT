import express from "express";
import Lixeira from "../models/lixeira";
const LixeirasRouter = express.Router();
LixeirasRouter.post("/lixeiras", (req, res) => {
  res.send("Cria nova lixeira");
});
LixeirasRouter.get("/Lixeiras", (req, res) => {
  const lixeiras: Lixeira[] = [
    {
      id: 1,
      longitude: 0.0,
      latitude: 0.0,
      capacidadeAtual: 0.0,
      capacidadeMaxima: 100.0,
      ocupacaoAtual: 0.0,
      estacao: "B",
    },
    {
      id: 2,
      longitude: 0.0,
      latitude: 0.0,
      capacidadeAtual: 0.0,
      capacidadeMaxima: 100.0,
      ocupacaoAtual: 0.0,
      estacao: "A",
    },
  ];
  res.json(lixeiras);
});
LixeirasRouter.get("/Lixeiras/:id", (req, res) => {
  const id: number = +req.params.id;
  res.send(`Lê a lixeira ${id}`);
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
