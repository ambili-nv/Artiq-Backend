// const express = require('express');
// const connectDatabase = require('./config/connection')
// const dotenv = require('dotenv');
// const cors = require('cors')


// dotenv.config();

// const app = express();


// app.use(cors({
//     origin:'*',
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//     credentials: true,
//   }))
//   app.use((req, res, next) => {
//     console.log(`${req.method} ${req.url}`);
//     next();
//   });
  

// // Connect to database
// connectDatabase();

// // Middleware
// app.use(express.json());

// // Start the server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT,()=>{
//     console.log(`Server started http://localhost:${PORT}`);
// })



const express = require('express');
const connectDatabase = require('./config/connection');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/routes'); // Import your user routes

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Connect to database

// Middleware for parsing JSON
app.use(express.json());

// Use user routes
app.use('/api', userRoutes); // Add this line to use user routes

connectDatabase();
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
