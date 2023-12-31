const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ly9jdk7.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const brandsCollection = await client.db("brandsDB").collection("brands");
    const productCollection = await client
      .db("productsDB")
      .collection("products");
    const cartCollection = await client.db("cartDB").collection("cart");
    const emailCollection = await client.db("emailDB").collection("email");

    app.get("/products", async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/brands", async (req, res) => {
      const cursor = brandsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/cart", async (req, res) => {
      const cursor = cartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // send to server from form input
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      console.log(newProduct);

      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });
    // send brand to server from form input
    app.post("/brands", async (req, res) => {
      const brand = req.body;
      console.log(brand);

      const result = await brandsCollection.insertOne(brand);
      res.send(result);
    });
    //post to cart
    app.post("/cart", async (req, res) => {
      const cartItem = req.body;
      console.log(cartItem);

      const result = await cartCollection.insertOne(cartItem);
      console.log("added to cart");

      res.send(result);
    });

    // send email to server
    app.post("/emails", async (req, res) => {
      const newEmail = req.body;
      console.log(newEmail);
      const result = await emailCollection.insertOne(newEmail);
      res.send(result);
    });

    //single product for details
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    app.get("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.findOne(query);
      res.send(result);
    });

    //update a single product
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateProduct = req.body;
      const product = {
        $set: {
          image: updateProduct.image,
          name: updateProduct.name,
          brand: updateProduct.brand,
          type: updateProduct.type,
          price: updateProduct.price,
          rating: updateProduct.rating,
          description: updateProduct.description,
        },
      };

      const result = await productCollection.updateOne(
        filter,
        product,
        options
      );
      res.send(result);
      console.log("updated successfully");
    });

    //Delete from cart
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
      console.log("deleted", id);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Brand shop server running");
});

app.listen(port, () => {
  console.log("Brand shop server listening on port: ", port);
});
