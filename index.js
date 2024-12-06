require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();

// middle ware
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('server is running')
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@srity.emu4l.mongodb.net/?retryWrites=true&w=majority&appName=Srity`;

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

        const campaignData = client.db('campaingDB').collection('campaigns')

        // sending the data to the server/dataBase
        app.post('/addCampaign', async(req,res) => {
            const addCampaign = req.body;
            const result = await campaignData.insertOne(addCampaign)
            res.send(result)
        })

        // using get method to show data on the UI
        app.get('/addCampaign', async(req, res) => {
            const cursor = campaignData.find();
            const result = await cursor.toArray();
            res.send(result)
        })





        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.listen(port, () => {
    console.log(`server is running on ${port}`)
})