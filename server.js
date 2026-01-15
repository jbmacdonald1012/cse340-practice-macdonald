import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use((req, res, next) => {
  res.locals.NODE_ENV = NODE_ENV.toLowerCase() || 'production';
  next();
});

app.get('/', (req, res) => {
  const title = 'Welcome Home';
  res.render('home', { title, NODE_ENV });
});

app.get('/about', (req, res) => {
  const title = 'About Us';
  res.render('about', { title, NODE_ENV });
});

app.get('/products', (req, res) => {
  const title = 'Our Products';
  res.render('products', { title, NODE_ENV });
});

app.get('/student', (req, res) => {
  const title = 'Student Information';
  res.render('student', { title, NODE_ENV });
});

if (NODE_ENV.includes('dev') || NODE_ENV === 'development') {
  import('ws')
    .then(({ WebSocketServer }) => {
      try {
        const wsPort = parseInt(PORT) + 1;
        const wss = new WebSocketServer({ port: wsPort });

        wss.on('listening', () => {
          console.log(`WebSocket server is running on port ${wsPort}`);
        });

        wss.on('error', (error) => {
          console.error('WebSocket server error:', error);
        });

        wss.on('connection', () => {
          console.log('Client connected to WebSocket');
        });
      } catch (error) {
        console.error('Failed to start WebSocket server:', error);
      }
    })
    .catch((err) => {
      console.error('Failed to import ws module:', err);
    });
}

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});