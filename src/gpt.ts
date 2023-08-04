import { RetrievalQAChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { redis, redisVectorStore } from './redis-store';

const openAiChat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  temperature: 0.3,
});

const prompt = new PromptTemplate({
  template: `
    You answer questions about Pokémon.
    The user is looking at Pokédex entries.
    Use the content of the entries below to reply to the question.
    If the answer isn't found in the entries, reply that you don't know, don't try to make up an answer.

    If possible, cite the names of some Pokémon who fit the entries.

    Entries:
    {context}

    Question:
    {question}
  `.trim(),
  inputVariables: ['context', 'question'],
});

const chain = RetrievalQAChain.fromLLM(openAiChat, redisVectorStore.asRetriever(10), {
  prompt,
  returnSourceDocuments: true,
  verbose: true,
});

async function main() {
  await redis.connect();

  const response = await chain.call({
    query: 'Are fire Pokémon immune to fire?'
  });

  console.log(response);

  await redis.disconnect();
}

main();
