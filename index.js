const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nbenc92.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    const toyCollections = client.db("Toys-Marketplace").collection('Toys-Data');

    app.get('/toys', async (req, res) => {
      const cursor = toyCollections.find();
      const result = await cursor.toArray();
      res.send(result);
    });

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

    app.get('/updateData', async (req, res) => {
      let query = {};
      if (req.query?._id) {
        query = { _id: new ObjectId(req.query._id) };
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
      const result = await toyCollections.insertOne(toy);
      res.send(result);
    });

    app.delete('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollections.deleteOne(query);
      res.send(result); 
    });

    app.patch('/toys/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedToy = req.body;
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toyCollections.updateOne(filter, updateDoc, options);
      res.send({ modifiedCount: result.modifiedCount });
    });    

    app.get("/", (req, res) => {
      res.send("data is running");
    });

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}

run().catch(console.dir);
