// =============================================================
//  CONFIGURAÇÕES DO ODONTOBOT — edite aqui sem medo
// =============================================================
const CONFIG = {
  // Link CSV da Planilha Google (Arquivo > Compartilhar > Publicar na Web > CSV).
  // Deixe vazio ("") para usar o arquivo conteudo.csv que está junto do site.
  planilhaCSV: "",

  // Link público do site (usado no QR Code). Se vazio, usa o endereço atual.
  linkPublico: "https://odontobot-up.netlify.app",

  mensagemBoasVindas:
    "Olá! 😊 Eu sou o **OdontoBot**, seu assistente virtual odontológico.\nEscolha uma das opções abaixo ou digite sua pergunta.",

  mensagemNaoSei:
    "Desculpe, não tenho essa informação no meu conteúdo. 🙁\nPara a sua segurança, procure um **cirurgião-dentista** para uma avaliação personalizada.",

  // Quão parecida a pergunta precisa ser com o conteúdo (0 a 1).
  // Mais alto = mais exigente (responde menos, erra menos).
  limiarConfianca: 0.45,
};
