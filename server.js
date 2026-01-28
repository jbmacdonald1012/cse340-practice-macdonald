import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();

// Course data - place this after imports, before routes
const courses = {
  'CS121': {
    id: 'CS121',
    title: 'Introduction to Programming',
    description: 'Learn programming fundamentals using JavaScript and basic web development concepts.',
    credits: 3,
    sections: [
      { time: '9:00 AM', room: 'STC 392', professor: 'Brother Jack' },
      { time: '2:00 PM', room: 'STC 394', professor: 'Sister Enkey' },
      { time: '11:00 AM', room: 'STC 390', professor: 'Brother Keers' }
    ]
  },
  'MATH110': {
    id: 'MATH110',
    title: 'College Algebra',
    description: 'Fundamental algebraic concepts including functions, graphing, and problem solving.',
    credits: 4,
    sections: [
      { time: '8:00 AM', room: 'MC 301', professor: 'Sister Anderson' },
      { time: '1:00 PM', room: 'MC 305', professor: 'Brother Miller' },
      { time: '3:00 PM', room: 'MC 307', professor: 'Brother Thompson' }
    ]
  },
  'ENG101': {
    id: 'ENG101',
    title: 'Academic Writing',
    description: 'Develop writing skills for academic and professional communication.',
    credits: 3,
    sections: [
      { time: '10:00 AM', room: 'GEB 201', professor: 'Sister Anderson' },
      { time: '12:00 PM', room: 'GEB 205', professor: 'Brother Davis' },
      { time: '4:00 PM', room: 'GEB 203', professor: 'Sister Enkey' }
    ]
  }
};

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

app.get('/test-error', (req, res, next) => {
  const err = new Error('This is a test error');
  err.status = 500;
  next(err);
});

app.get('/admin', (req, res, next) => {
  const err = new Error('Access Denied');
  err.status = 403;
  next(err);
});

app.get('/catalog', (req, res) => {
  res.render('catalog', {
      title: 'Course Catalog',
      courses: courses});
});

// Enhanced course detail route with sorting
app.get('/catalog/:courseId', (req, res, next) => {
  const courseId = req.params.courseId;
  const course = courses[courseId];
  if (!course) {
    const err = new Error(`Course ${courseId} not found`);
    err.status = 404;
    return next(err);
  }
  // Get sort parameter (default to 'time')
  const sortBy = req.query.sort || 'time';
  // Create a copy of sections to sort
  let sortedSections = [...course.sections];
  // Sort based on the parameter
  switch (sortBy) {
    case 'professor':
      sortedSections.sort((a, b) => a.professor.localeCompare(b.professor));
      break;
    case 'room':
      sortedSections.sort((a, b) => a.room.localeCompare(b.room));
      break;
    case 'time':
    default:
      // Keep original time order as default
      break;
  }
  console.log(`Viewing course: ${courseId}, sorted by: ${sortBy}`);
  res.render('course-detail', {
    title: `${course.id} - ${course.title}`,
    course: { ...course, sections: sortedSections },
    currentSort: sortBy
  });
});

app.use((req, res, next) => {
  const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
  if (res.headersSent || res.finished) {
    return next(error);
  }

  const status = error.status || 500;
  let template;
  switch(status) {
    case 404:
      template = '404';
      break;
    case 403:
      template = '403';
      break;
    default:
      template = '500';
  }

  const context = {
    title: status === 404 ? 'Page Not Found' : 'Server Error',
    error: NODE_ENV === 'production' ? 'An error occurred' : error.message,
    stack: NODE_ENV === 'production' ? null : error.stack,
    NODE_ENV
  };

  try
  {
    res.status(status).render(`errors/${template}`, context);
  }
  catch (renderError)
  {
    if(!res.headersSent) {
      res.status(status).send(`<h1>Error ${status}</h1><p>'An error occurred.'</p>`);
    }
  }

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