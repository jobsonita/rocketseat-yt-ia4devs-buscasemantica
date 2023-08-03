import path from 'node:path';

import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { TokenTextSplitter } from 'langchain/text_splitter';

const loader = new DirectoryLoader(
  path.join(__dirname, './assets/pokedex/'),
  {
    '.json': path => new JSONLoader(path, '/description'),
  }
)

async function load() {
  const docs = await loader.load();

  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: 600, // won't do anything for short descriptions
    chunkOverlap: 0,
  });

  const splittedDocuments = await splitter.splitDocuments(docs);

  console.log(splittedDocuments);
}

load();
