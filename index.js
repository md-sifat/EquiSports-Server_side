const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

const { MongoClient, ServerApiVersion , ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/?retryWrites=true&w=majority&appName=${process.env.MONGO_APP_NAME}`;

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

        const userCollection = client.db(process.env.MONGO_DB_NAME).collection("users");
        const equipmentCollection = client.db(process.env.MONGO_DB_NAME).collection("equipments");

        app.get('/users' , async(req ,res) => {
            const user = await userCollection.find().toArray();
            res.send(user);
        });

        app.post('/users' , async(req , res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        });
    
        app.delete('/users/:id' , async(req ,res) => {
            const id = req.params.id;
            // console.log(`delete request has come`);
            const query = {_id : new ObjectId(id)}
            const result = await userCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/equipments', async (req, res) => {
            const equipments = await equipmentCollection.find().toArray();
            res.send(equipments);
        });

        app.post('/equipments', async (req, res) => {
            const equipment = req.body;
            const result = await equipmentCollection.insertOne(equipment);
            res.send(result);
        });

        app.delete('/equipments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await equipmentCollection.deleteOne(query);
            res.send(result);
        });

        app.put('/equipments/:id', async (req, res) => {
            const id = req.params.id;
            const updatedEquipment = req.body;
            const filter = { _id: new ObjectId(id) };
            const updateDoc = { $set: updatedEquipment };
            const result = await equipmentCollection.updateOne(filter, updateDoc);
            res.send(result);
        });


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("equisports-server_side is LIVE");
});

app.listen(port, () => {
    console.log(`server is running on port : ${port}`);
}
);
