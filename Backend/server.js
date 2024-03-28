// server.js

import { app, server, io } from './app.js';
import indexRouter from './router.js';
import { registerChatHandlers } from './chat.js';

app.use('/', indexRouter);

registerChatHandlers(io);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
