// Importa a biblioteca do Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave de API será pega das variáveis de ambiente da Netlify (Passo 5)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async function (event, context) {
  // Permite que apenas o seu site acesse esta função
  const headers = {
    'Access-Control-Allow-Origin': '*', // Ou coloque o URL do seu site para mais segurança
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Lida com a requisição pre-flight do navegador
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Pega o prompt enviado pela calculadora
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      throw new Error("Nenhum prompt foi fornecido.");
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ text: text }),
    };

  } catch (error) {
    console.error("Erro na função do Gemini:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Ocorreu um erro ao processar sua solicitação." }),
    };
  }
};
