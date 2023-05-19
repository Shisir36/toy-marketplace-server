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

    app.get('/toys', async( req, res) => {
        const cursor = toyCollections.find()
        const result = await cursor.toArray();
        res.send(result);
    })
    app.get("/toys/:subcategory", async (req, res) => {
        const text = req.params.subcategory;
        const result = await toyCollections.find({
            $or: [
              { subCategory: { $regex: text, $options: "i" } },
            ],
          })
          .toArray();
        res.send(result);
      });
      app.get(`/toys/id/:toyId`, async (req, res) => {
        const id = req.params.toyId;
        console.log(id);
        const query = { _id: new ObjectId(id) };
        console.log(query); // Use ObjectId constructor to create ObjectId instance
        const options = {
            // Include only the `title` and `imdb` fields in the returned document
            projection: { name: 1, price: 1,pictureUrl:1,sellerEmail:1,sellerName:1,subCategory:1,rating:1,quantity:1,description:1 },
        };
        const result = await toyCollections.findOne(query, options);
        res.send(result);
      });      
    app.post("/toys", async(req, res) => {
        const toy = req.body;
        const result = await toyCollections.insertOne(toy)
        res.send(result)
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
