const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log(
    'Testing with API Key:',
    apiKey ? apiKey.substring(0, 10) + '...' : 'undefined',
  );

  if (!apiKey) {
    console.error('No GEMINI_API_KEY found in .env');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Say Hello');
    console.log('Gemini API Success Response:', result.response.text());

    const embedModel = genAI.getGenerativeModel({
      model: 'gemini-embedding-2',
    });
    const embedResult = await embedModel.embedContent('Hello World');
    console.log(
      'Embedding Success (length):',
      embedResult.embedding.values.length,
    );
  } catch (error) {
    console.error('Gemini API Failed:');
    console.error(error);
  }
}

testGemini();
