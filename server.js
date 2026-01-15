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

app.get('/', (req, res) => {
  const title = 'Welcome Home';
  res.render('home', { title });
});
app.get('/about', (req, res) => {
  const title = 'About Us';
  res.render('about', { title });
});
app.get('/products', (req, res) => {
  const title = 'Our Products';
  res.render('products', { title });
});

app.get('/student', (req, res) => {
  const title = 'Student Information';
  res.render('student', { title });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
