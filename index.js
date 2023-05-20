const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;
// Middleware
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nbenc92.mongodb.net/?retryWrites=true&w=majority`;

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
    const toyCollections = client.db("Toys-Marketplace").collection('Toys-Data')

    app.get('/toys', async (req, res) => {
      const cursor = toyCollections.find()
      const result = await cursor.toArray();
      res.send(result);
    })
    app.get('/toys/:subcategory', async (req, res) => {
      const subcategory = req.params.subcategory;
      const result = await toyCollections.find({
        subCategory: { $regex: subcategory, $options: "i" }
      }).toArray();
      res.send(result);
    });
    app.get('/toysdata', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toyCollections.find(query).toArray();
      res.send(result);
    });   
    app.get('/toys/id/:toyId', async (req, res) => {
      const id = req.params.toyId;
      const data = { _id: new ObjectId(id) };
      const options = {
        projection: { name: 1, price: 1, pictureUrl: 1, email: 1, sellerName: 1, subCategory: 1, rating: 1, quantity: 1, description: 1 },
      };
      const result = await toyCollections.findOne(data, options);
      res.send(result);
    });
    app.post("/toys", async (req, res) => {
      const toy = req.body;
      const result = await toyCollections.insertOne(toy)
      res.send(result)
    })
    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      console.log(query);
       const result = await toyCollections.deleteOne(query);
      console.log(result);
       res.send(result); 
    });
    app.patch('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      console.log(updatedToy);
      const updateDoc = {
          $set: {
              status: updatedToy.status
          },
      };
      const result = await toyCollections.updateOne(filter, updateDoc);
      res.send(result);
  })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Alhamdulillah data is running");
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
