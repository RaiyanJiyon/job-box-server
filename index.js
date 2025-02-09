const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5qizv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });

        // Get the database and collection on which to run the operation
        const jobsCollection = client.db("jobDB").collection("jobs");

        app.get('/jobs', async (req, res) => {
            try {
                const result = await jobsCollection.find().toArray();

                if (result.length > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'Jobs data not found!' });
                }
            } catch (error) {
                console.error('Error fetching job data:', error);
                res.status(500).send({ message: 'Failed to fetch job data' });
            }
        });

        app.get('/jobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = {_id: new ObjectId(id)};
                const result = await jobsCollection.findOne(query);

                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'Job data not found!' });
                }
            } catch (error) {
                console.error('Error fetching job data:', error);
                res.status(500).send({ message: 'Failed to fetch job data' });
            }
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello Job Box');
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
