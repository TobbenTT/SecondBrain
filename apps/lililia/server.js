const express = require('express');
const path = require('path');
const app = express();
const port = 3002;

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('view cache', false);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
