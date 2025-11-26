const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient, ServerApiVersion,ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://groceryUserDB:3NFfM6hwlUMhLIxG@cluster0.r9l6yhe.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  const db = client.db("grocery");
  const productsCollection = db.collection("products");

  // GET all products
  app.get("/shop", async (req, res) => {
    try {
      const result = await productsCollection.find().toArray();
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });

  // Latest products
  app.get("/latestProducts", async (req, res) => {
    const result = await productsCollection
      .find()
      .sort({ _id: -1 })
      .limit(8)
      .toArray();
    res.send(result);
  });

  // POST new product
  app.post("/shop", async (req, res) => {
    const newProduct = req.body;
    const result = await productsCollection.insertOne(newProduct);
    res.send({ success: true, result });
  });

  // GET single product by ID
app.get("/shop/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    if (!product) {
      return res.status(404).send({ error: "Product not found" });
    }
    res.send(product);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});

app.get("/ManageProducts", async (req, res) => {
  try {
    const email= req.query.email;
    const query = email ? { addedBy : email } : {};
    const result = await productsCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Server error" });
  } 
});

  // DELETE product by ID
  app.delete("/ManageProducts/:id", async (req, res) => {
    try {
      const id = req.params.id; 
      const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
      if (result.deletedCount === 0) {
        return res.status(404).send({ error: "Product not found" });
      }
      res.send({ success: true, result });
    } catch (error) {
      res.status(500).send({ error: "Server error" });
    }
  });
  app.put("/ManageProducts/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await productsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});


  console.log("MongoDB Ready");
}

run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

