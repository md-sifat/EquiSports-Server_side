const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        // await client.connect();

        const userCollection = client.db(process.env.MONGO_DB_NAME).collection("users");
        const equipmentCollection = client.db(process.env.MONGO_DB_NAME).collection("equipments");

        app.get('/users', async (req, res) => {
            const user = await userCollection.find().toArray();
            res.send(user);
        });

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await userCollection.insertOne(user);
            res.send(result);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(`delete request has come`);
            const query = { _id: new ObjectId(id) }
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
            console.log(result);
            res.send(result);
        });

        app.get('/equipments/:id', async (req, res) => {
            try {
                const equipmentId = req.params.id;
                console.log(equipmentId);
                const equipment = await equipmentCollection.findOne({ _id: new ObjectId(equipmentId) });
                console.log(equipment);
                if (!equipment) {
                    return res.status(404).json({ message: "Equipment not found" });
                }
                res.json(equipment);
            } catch (error) {
                res.status(500).json({ message: "Server error" });
            }
        });

        app.delete('/equipments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await equipmentCollection.deleteOne(query);
            res.send(result);
        });

        const { ObjectId } = require("mongodb");

        app.put("/equipments/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const { _id, ...updatedEquipment } = req.body; // Exclude _id from update

                const filter = { _id: new ObjectId(id) };
                const updateDoc = { $set: updatedEquipment };

                const result = await equipmentCollection.updateOne(filter, updateDoc);

                if (result.modifiedCount > 0) {
                    res.send({ success: true, message: "Equipment updated successfully" });
                } else {
                    res.send({ success: false, message: "No changes made or equipment not found" });
                }
            } catch (error) {
                console.error("Error updating equipment:", error);
                res.status(500).send({ success: false, message: "Internal Server Error" });
            }
        });



        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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
