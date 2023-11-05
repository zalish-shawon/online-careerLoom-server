const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port= process.env.PORT || 5000


app.use(cors());
app.use(express.json());


//careerLoom
//QRcHOcmfnFXo0bGG

const uri = "mongodb+srv://careerLoom:QRcHOcmfnFXo0bGG@cluster0.hrjn1tt.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    const jobsCollection = client.db("careerLoomDB").collection("jobs");


    app.get("/jobs", async(req, res) => {
        const cursor = jobsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    //job for update

    app.get("/jobs/:id", async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await jobsCollection.findOne(query);
        res.send(result);
    })

    app.post("/jobs", async(req, res) => {
        const job = req.body;
        const result = await jobsCollection.insertOne(job);
        res.send(result);
    })

    //update jobs
    app.put("/jobs/:id", async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const options = {upsert: true};
        const updateJob = req.body;
        const job = {
            $set: {
                email: updateJob.email,
                jobTitle: updateJob.jobTitle,
                image: updateJob.image,
                deadline: updateJob.deadline,
                maxPrice: updateJob.maxPrice,
                minPrice: updateJob.minPrice,
                category: updateJob.category,
                description: updateJob.description,
            }
        }
        const result = await jobsCollection.updateOne(filter, job, options);
        res.send(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('CareerLoom server is running')
})

app.listen(port, (req, res) => {
    console.log(`listening on ${port}`);
})