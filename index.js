const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config()
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port= process.env.PORT || 5000

app.use(cors({
  origin: [ //'http://localhost:5173',
  'https://careerloom-89809.web.app',
  'https://careerloom-89809.firebaseapp.com'

],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.hrjn1tt.mongodb.net/?retryWrites=true&w=majority`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyToken = async(req, res, next) =>{

    const token = req.cookies?.token;
  
    if(!token) {
      return res.status(401).send({message: 'unathorized access', code: "401"});
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decode) => {
      if(err) {
        return res.status(401).send({message: 'unathorized access', code: "401"})
      }
      req.user = decode;
      next()
    })
  
  }




async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    const jobsCollection = client.db("careerLoomDB").collection("jobs");
    const bidsCollection = client.db("careerLoomDB").collection("myBids");

    app.post("/jwt", async (req, res) => {
        const user = req.body;
        // console.log(user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
        res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // using http only for that false. if use https then use true
          
        })
        .send({success: true});

        // res.clearCookie('token', {
        //   maxAge: 0,
        //   sameSite: 'none',
        //   secure: true,
        // })
        // .send({success: true});
  
      })
      




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

    // delete jobs
    app.delete("/jobs/:id", async(req, res) => {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await jobsCollection.deleteOne(query)
        res.send(result);
      });

      // bids
      app.get("/myBids",verifyToken, async(req, res) => {
        const cursor = bidsCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.post("/myBids", async(req, res) => {
        const job = req.body;
        const result = await bidsCollection.insertOne(job);
        res.send(result);
    })

    app.get("/mybids/:id", async(req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await bidsCollection.findOne(query);
        res.send(result);
    })

    app.patch("/mybids/:id", async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
       
        const updateJob = req.body;
        const job = {
            $set: {
                status: updateJob.status,
                statusforRequester: updateJob.statusforRequester,
                
            }
        }
        const result = await bidsCollection.updateOne(filter, job);
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


