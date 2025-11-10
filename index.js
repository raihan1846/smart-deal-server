const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://raihan:root@cluster0.7ziiyhp.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

async function run() {
  try {
    await client.connect();
    
    const db = client.db("sample_mflix");
    const productsCollections = db.collection("products");

    app.get('/products', async (req,res)=>{
     const cursor = productsCollections.find();
     const result = await cursor.toArray();
     res.send(result)
    });

    app.get('/products/:id', async (req, res)=>{
    const id = req.params.id;
    const query = {_id : new ObjectId(id)}
    const result = await productsCollections.findOne(query);
    res.send(result)
    })

    app.post('/products', async (req, res)=>{
      const newProducts = req.body;
      const result = await productsCollections.insertOne(newProducts);
      res.send(result);
    })

    app.patch('/products/:id', async (req, res)=>{
      const id = req.params.id;
      const updatedProducts = req.body;
      const query = {_id: new ObjectId(id)}
      const update ={
        $set: updatedProducts
      }
      const result = await productsCollections.updateOne(query, update);
      res.send(result);
    })

    app.delete('/products/:id', async (req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await productsCollections.deleteOne(query);
      res.send(result);
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

  app.listen(port, () => {
    console.log(`server is running on port ${port}`)
  })