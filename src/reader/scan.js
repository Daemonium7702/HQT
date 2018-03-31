import WebSocket from 'ws';
import fs from 'fs';
import parse from './parse';
import resolvers from '../resolvers';
import log from '../log';

const storeQuestion = (question) => {
  const current = JSON.parse(fs.readFileSync('./data/questions.json'));
  current.questions.push(question);
  fs.writeFile('./data/questions.json', JSON.stringify(current, null, '\t'), () => {
    log.success('Question stored in JSON');
  });
};

export default function scan(socketUrl) {
  const ws = new WebSocket(socketUrl, {
    headers: {
      // Connection: 'Keep-Alive',
      // Host: 'api-quiz.hype.space',
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
      // 'Accept-Encoding': 'gzip',
      'User-Agent': 'okhttp/3.8.0',
      'x-hq-client': 'Android/1.5.1',
      'x-hq-lang': 'en',
      'x-hq-stk': 'MQ==',
    },
  });

  ws.on('open', () => {
    log.success('Connected to websocket');
  });

  ws.on('close', () => {
    log.warn('Disconnected from websocket');
  });

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.type !== 'question') return;
    log.success('Question found, resolving... \n');
    const question = parse(data);
    const results = await resolvers.init(question);
    storeQuestion(message);
    console.log(results);
  });
}
