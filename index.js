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
        const usersCollection = client.db("jobDB").collection("users");

        // jobs related API's
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
                const query = { _id: new ObjectId(id) };
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
        });

        app.get('/featured-jobs', async (req, res) => {
            try {
                const result = await jobsCollection
                    .find()
                    .sort({ postedTime: -1 })
                    .limit(6)
                    .toArray();

                if (result.length > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'Featured jobs data not found!' });
                }

            } catch (error) {
                res.status(500).send({ error: "Failed to fetch featured jobs" });
            }
        });

        app.post('/jobs', async (req, res) => {
            try {
                const newJob = req.body;
                const result = await jobsCollection.insertOne(newJob);
        
                if (result.insertedCount === 1) {
                    res.status(201).send(result);
                } else {
                    res.status(400).send({ success: false, message: 'Failed to insert job' });
                }
            } catch (error) {
                res.status(500).send({ success: false, message: 'Internal server error' });
            }
        });        

        // GET all users
        app.get('/users', async (req, res) => {
            try {
                const { email } = req.query;
        
                if (email) {
                    const existingUser = await usersCollection.findOne({ email });
        
                    if (existingUser) {
                        return res.status(200).send(existingUser);
                    } else {
                        return res.status(200).send(null);
                    }
                }
        
                // If no email is provided, return all users
                const result = await usersCollection.find().toArray();
                res.status(200).send(result);
            } catch (error) {
                console.error("Error fetching users data:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch users data' });
            }
        });

        // GET a user by Email
        app.get('/users/:email', async (req, res) => {
            try {
                const email = req.params.email;
                const query = {email: email};
                const result = await usersCollection.findOne(query);

                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({message: 'User data not found'});
                }
            } catch (error) {
                res.status(500).send({message: 'Failed to fetch user data'});
            }
        });

        // POST a new user
        app.post('/users', async (req, res) => {
            try {
                const newUser = req.body;

                // Validate the incoming data (example: check if `name` exists)
                if (!newUser || !newUser.name || !newUser.email || !newUser.role) {
                    return res.status(400).send({ success: false, message: 'Invalid user data' });
                }

                // Insert the new user into the collection
                const result = await usersCollection.insertOne(newUser);

                // Check if the user was successfully inserted
                if (result.insertedId) {
                    res.status(201).send({ success: true, result });
                } else {
                    res.status(400).send({ success: false, message: "Failed to insert user" });
                }
            } catch (error) {
                console.error("Error inserting user:", error);
                res.status(500).send({ success: false, message: "Internal server error" });
            }
        });

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
