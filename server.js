import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// app.set('view engine', 'ejs');

// app.set('views', path.join(__dirname, 'src/views'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/home.html'));
});
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/about.html'));
});
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/products.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://127.0.0.1:${PORT}`);
});
