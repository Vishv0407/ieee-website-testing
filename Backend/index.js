const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
require('dotenv').config();

const dbConnect = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');
const allRoutes = require('./routes/routes');

// Middleware
app.use(express.json()); // Body parser middleware to parse JSON body
app.use(express.urlencoded({ extended: true })); // Body parser middleware to parse URL-encoded bodies
app.use(cors()); // Enable CORS for all routes

const fileUpload = require('express-fileupload');
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

// Database connection
dbConnect();
cloudinaryConnect();

// Routes
app.use('/api', allRoutes);

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Boooooooooom, your server is started"
    });
});


// Serve static files
app.use('/CSS', express.static(path.join(__dirname, '../CSS'))); // Adjust the path accordingly
app.use('/Images', express.static(path.join(__dirname, '../Images'))); // Adjust the path accordingly
app.use('/js', express.static(path.join(__dirname, '../js'))); // Adjust the path accordingly


app.get('/committee', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', 'commitee-page.html'));
});

app.get('/achievements', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', 'achievements.html'));
});

app.get('/events', (req, res) => {
    res.sendFile(path.join(__dirname, '../pages', 'event-page.html'));
});

// Serve static files (like CSS, JS) if you have them
app.use(express.static(path.join(__dirname, '../pages')));

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
