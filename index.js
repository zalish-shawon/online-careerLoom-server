const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port= process.env.PORT || 5000


app.use(cors());
app.use(express.json());







app.get('/', (req, res) => {
    res.send('CareerLoom server is running')
})

app.listen(port, (req, res) => {
    console.log(`listening on ${port}`);
})