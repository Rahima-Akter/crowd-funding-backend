require('dotenv').config();
const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const donationDB = client.db('campaingDB').collection('donationCollection')


        // using get method to show data on the UI
        app.get('/addCampaign', async (req, res) => {
            const cursor = campaignData.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // get detail of an specific data
        // app.get('/addCampaign/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await campaignData.findOne(query);
        //     res.send(result)
        // })

        // get my donation data based on the user email
        // app.get('/addCampaign/:email', async (req, res) => {
        //     const email = req.params.email;
        //     const query = { userEmail: email }
        //     const result = await donationDB.find(query).toArray();
        //     res.send(result)
        // })

        // addCampaign search parameters with both id and email
        app.get('/addCampaign/:param', async (req, res) => {
            const param = req.params.param;
            try {
                let result;
                if (ObjectId.isValid(param)) {
                    const query = { _id: new ObjectId(param) };
                    result = await campaignData.findOne(query);
                } else {
                    const query = { userEmail: param };
                    result = await campaignData.find(query).toArray();
                }

                if (!result) {
                    return res.status(404).send({ message: 'No matching campaign found.' });
                }

                res.send(result);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
                res.status(500).send({ message: 'Error fetching campaigns.' });
            }
        });


        // getting donation data from the database
        app.get('/donation', async (req, res) => {
            const cursor = donationDB.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        // donation search parameters with both id and email
        app.get('/donation/:param', async (req, res) => {
            const param = req.params.param;

            try {
                let result;
                if (ObjectId.isValid(param)) {
                    const query = { _id: new ObjectId(param) };
                    result = await donationDB.findOne(query);
                } else {
                    const query = { userEmail: param };
                    result = await donationDB.find(query).toArray();
                }

                if (!result) {
                    return res.status(404).send({ message: 'No matching campaign found.' });
                }

                res.send(result);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
                res.status(500).send({ message: 'Error fetching campaigns.' });
            }
        });

        // sending donation data to the database
        app.post('/donation', async (req, res) => {
            const donation = req.body;
            const result = await donationDB.insertOne(donation);
            res.send(result);
        })

        // sending the data to the server/dataBase
        app.post('/addCampaign', async (req, res) => {
            const addCampaign = req.body;
            const result = await campaignData.insertOne(addCampaign)
            res.send(result)
        })

        // update MyCampaign deta
        app.patch('/addCampaign/:id', async (req, res) => {
            const updateId = req.params.id;
            const filter = { _id: new ObjectId(updateId) };
            const option = { upsert: true };
            const updateData = req.body;
            const update = {
                $set: {
                    image: updateData.image,
                    title: updateData.title,
                    type: updateData.type,
                    description: updateData.description,
                    minDonation: updateData.minDonation,
                    deadline: updateData.deadline,
                }
            }
            const result = await campaignData.updateOne(filter, update, option)
            res.send(result)
        });

        // delete a campaign
        app.delete('/addCampaign/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await campaignData.deleteOne(query);
            res.send(result)
        });

        // delete my donation
        app.delete('/donation/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await donationDB.deleteOne(query);
            res.send(result)
        })

        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
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