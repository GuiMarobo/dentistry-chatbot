// =============================================================
//  BUSCA — encontra o conteúdo cadastrado mais parecido com a pergunta
//
//  1. Normaliza o texto (minúsculas, sem acentos, sem pontuação)
//  2. Remove palavras vazias ("como", "o", "de"...) e aplica sinônimos
//  3. Compara as palavras da pergunta com as de cada item cadastrado
//     (título, palavras-chave e resposta), aceitando variações
//     ("escovar" ≈ "escovação" porque começam igual)
//  4. Palavras raras pesam mais que palavras comuns (ex.: "siso" > "dente")
//  5. Nota final de 0 a 1. Abaixo do limite → "não sei, procure um dentista"
// =============================================================

const PALAVRAS_VAZIAS = new Set((
  "a o as os um uma uns umas de do da dos das no na nos nas em por para pra pro com sem " +
  "e ou que qual quais quando como onde porque por que pq quem eu me meu minha meus minhas " +
  "voce vc seu sua seus suas ele ela eles elas isso isto esse essa este esta ao aos se " +
  "ja nao sim mais muito muita muitos pode posso devo deve preciso precisa tenho tem ter " +
  "fazer faz fica ficar estou esta estao ser sou e eh foi vai vou sobre algum alguma " +
  "dia dias depois antes apos ate tambem entao gostaria queria quero saber duvida ola oi"
).split(" "));

const SINONIMOS = {
  doi: "dor", doendo: "dor", dolorido: "dor", dores: "dor", doer: "dor",
  sangue: "sangramento", sangrando: "sangramento",
  arrancar: "extracao", arranquei: "extracao", extrai: "extracao", tirei: "extracao", tirou: "extracao",
  comendo: "comer", comida: "comer", alimentar: "comer", alimentacao: "comer",
  fita: "fio", hilo: "fio",
  lavar: "escovar", limpar: "higienizar", limpeza: "higienizacao",
  bafo: "halito", cheiro: "halito",
  criancas: "crianca", filho: "crianca", bebe: "crianca", infantil: "crianca",
  branco: "clareamento", branquear: "clareamento", clarear: "clareamento",
  pasta: "creme", remedio: "medicamentos", remedios: "medicamentos", medicamento: "medicamentos",
};

function normalizar(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// "escovação", "escovar", "escova" → "escov"
function radical(palavra) {
  return palavra.length >= 5 ? palavra.slice(0, 5) : palavra;
}

function extrairPalavras(texto) {
  return normalizar(texto)
    .split(" ")
    .filter((p) => p.length >= 2 && !PALAVRAS_VAZIAS.has(p))
    .map((p) => SINONIMOS[p] || p);
}

// Pesos de cada campo do item
const PESOS = { titulo: 1, palavras: 0.9, subcategoria: 0.6, resposta: 0.35 };

function criarIndice(itens) {
  const docs = itens.map((item) => {
    const exatas = new Map();
    const radicais = new Map();
    for (const [campo, peso] of Object.entries(PESOS)) {
      for (const p of extrairPalavras(item[campo])) {
        exatas.set(p, Math.max(exatas.get(p) || 0, peso));
        const r = radical(p);
        radicais.set(r, Math.max(radicais.get(r) || 0, peso));
      }
    }
    return { item, exatas, radicais };
  });

  // Frequência de cada radical → palavras raras valem mais (IDF)
  const freq = new Map();
  for (const d of docs) for (const r of d.radicais.keys()) freq.set(r, (freq.get(r) || 0) + 1);
  const N = docs.length || 1;
  const importancia = (r) => Math.log(1 + N / (freq.get(r) || 1));

  return { docs, importancia };
}

function buscar(indice, pergunta, limite = 3) {
  const palavras = [...new Set(extrairPalavras(pergunta))];
  if (!palavras.length) return [];

  const pesosPergunta = palavras.map((p) => indice.importancia(radical(p)));
  const total = pesosPergunta.reduce((a, b) => a + b, 0);

  return indice.docs
    .map((d) => {
      let soma = 0;
      palavras.forEach((p, i) => {
        const exata = d.exatas.get(p) || 0;
        const parecida = (d.radicais.get(radical(p)) || 0) * 0.85;
        soma += pesosPergunta[i] * Math.max(exata, parecida);
      });
      return { item: d.item, nota: soma / total };
    })
    .filter((r) => r.nota > 0)
    .sort((a, b) => b.nota - a.nota)
    .slice(0, limite);
}

if (typeof module !== "undefined") module.exports = { normalizar, extrairPalavras, criarIndice, buscar };
