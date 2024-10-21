const express = require('express');
const pool = require('./database');
const cors = require('cors')
const port = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.use(express.json());

``````````````
    //  Handling HTTP requests code will go here  

``````````````
app.listen(port, () => {
    console.log("Server is listening to port " + port)
});