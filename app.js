import express from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import cors from 'cors';


import dotenv from 'dotenv';
dotenv.config();
import './database/mongodb.js';
import './middlewares/error.middleware.js'; 
import authRouter from './routes/auth.routes.js';
import { ensureAuthenticated } from './middlewares/Auth.js';
import './models/user.model.js';

// Middleware
app.use(cors());
app.use(express.json()); 
app.use(express.static(path.join(__dirname, 'public')));


// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use('/auth', authRouter); 

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// app.get('/dashboard', ensureAuthenticated, (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
// });



// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is working with ES6 modules!' });
});   

// app.get('/auth/scholarships', (req, res) => {
//   const scholarships = [
//     {
//       name: 'National Merit Scholarship',
//       description: 'For outstanding students achieving top scores.',
//       deadline: '2025-12-31',
//       link: 'https://example.com/apply'
//     },
//     {
//       name: 'STEM Innovators Grant',
//       description: 'Scholarship for tech and science students.',
//       deadline: '2025-11-15',
//       link: 'https://example.com/stem'
//     }
//   ];

//   res.json(scholarships);
// });


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`ScholarFinder  is on http://localhost:${PORT}`);
  

});