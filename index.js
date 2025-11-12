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
    const bidsCollections = db.collection('bids');
    const usersCollections = db.collection('users');
    
    app.post('/users', async (req,res)=>{
      const newUser = req.body;
      const email = req.body.email;
      const query = {email: email}
      const existingUser = await usersCollections.findOne(query);
      if (existingUser) {
        res.send({message: 'user already exits.do not need to insert...'})
      }
      else{
        const result = await usersCollections.insertOne(newUser);
        res.send(result);
      }
    })
    app.get('/products', async (req,res)=>{
      // console.log(query, express.request);
      
      const email = req.query.email;
      const query = {}
      if (email) {
        query.email = email;
      }

    //  const cursor = productsCollections.find().sort({price_min: 1}).skip(2).limit(5);
     const cursor = productsCollections.find(query);
     const result = await cursor.toArray();
     res.send(result);

    });

    app.get('/products/:id', async (req, res)=>{
    const id = req.params.id;
    const query = {_id : new ObjectId(id)}
    const result = await productsCollections.findOne(query);
    res.send(result)

    })

    app.post('/products', async (req, res)=>{
      const newProducts = req.body;
      const result = await productsCollections.insertMany(newProducts);
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

    // bids related API
    app.get('/bids', async (req, res)=>{
      const email = req.query.email;
      const query = {}
      if (email) {
        query.buyer_email = email;
      }

      const cursor = bidsCollections.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })

    app.post('/bids', async (req,res)=>{
      const newBid = req.body;
      const result = await bidsCollections.insertOne(newBid);
      res.send(result);
    })

    app.delete('/bids/:id', async(req,res)=>{
       const id = req.params.id;
       const query = {_id : new ObjectId(id)}
       const result = await bidsCollections.deleteOne(query)
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