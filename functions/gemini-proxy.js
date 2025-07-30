// Importa a biblioteca do Google Generative AI
const { GoogleGenerativeAI } = require("@google/generative-ai");

// A chave de API será pega das variáveis de ambiente da Netlify
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.handler = async function (event, context) {
  // Configurações de segurança
  const headers = {
    'Access-Control-Allow-Origin': '*', // Ou coloque o URL do seu site para mais segurança
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Pega os DADOS BRUTOS enviados pela calculadora
    const data = JSON.parse(event.body);
    let prompt;

    // ** LÓGICA DE CONSTRUÇÃO DO PROMPT NO SERVIDOR (VERSÃO REFINADA) **
    if (data.type === 'description') {
      prompt = `Aja como uma artesã carinhosa e criativa, falando com uma amiga. Crie uma legenda curta e charmosa para um post de Instagram sobre a venda de um(a) "${data.pieceName}". O preço é ${data.finalPrice}. A peça foi feita com ${data.materials.join(', ')}. O texto deve ser dividido em pequenos parágrafos, usar uma linguagem natural e casual, e terminar com uma chamada para ação convidativa. Use poucos e bons emojis. Evite usar asteriscos ou negrito.`;
    } else if (data.type === 'suggestions') {
      prompt = `Aja como uma mentora de artesanato experiente e amigável. Crie 3 dicas rápidas e fáceis de entender para ajudar uma artesã a vender melhor seu/sua "${data.pieceName}", que custa ${data.finalPrice}. As dicas devem ser curtas, diretas e em um tom encorajador. Use uma linguagem simples. Formate a resposta em uma lista numerada (1., 2., 3.).`;
    } else {
      throw new Error("Tipo de solicitação inválido.");
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
