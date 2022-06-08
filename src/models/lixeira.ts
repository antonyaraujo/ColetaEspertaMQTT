type Lixeira = {
  id: number;
  longitude: number;
  latitude: number;
  capacidadeAtual: number;
  capacidadeMaxima: number;
  ocupacaoAtual: number; // dado em porcentagem (%)
  estacao: "A" | "B" | "c";
};

export default Lixeira;
