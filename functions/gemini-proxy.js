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

    // ** LÓGICA DE CONSTRUÇÃO DO PROMPT NO SERVIDOR **
    // O navegador não vê esta parte.
    if (data.type === 'description') {
      prompt = `Crie uma descrição de venda cativante e calorosa para um(a) "${data.pieceName}". A peça foi feita com os seguintes materiais: ${data.materials.join(', ')}. O preço de venda é ${data.finalPrice}. A descrição deve ser ideal para um post no Instagram, destacando o cuidado artesanal, a qualidade e o valor do produto. Use emojis para deixar o texto mais atraente.`;
    } else if (data.type === 'suggestions') {
      prompt = `Sou uma artesã e criei um(a) "${data.pieceName}" com estes materiais: ${data.materials.join(', ')}. Levei ${data.totalTime} para fazer e o preço de venda é ${data.finalPrice}. Me dê 3 ideias criativas e práticas para vender melhor este produto. As ideias podem incluir: para quem vender (público-alvo), como apresentar o produto de forma diferente, ou que outros produtos poderiam formar um kit com ele para aumentar o valor da venda. Formate a resposta com títulos para cada ideia.`;
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
