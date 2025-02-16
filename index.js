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
        const saveJobsCollection = client.db("jobDB").collection("saveJobs");
        const appliedJobsCollection = client.db("jobDB").collection("appliedJobs");
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

        app.get('/jobs-by-pagination', async (req, res) => {
            try {
                const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
                const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
        
                const totalJobs = await jobsCollection.countDocuments(); // Total number of jobs
                const totalPages = Math.ceil(totalJobs / limit); // Total pages based on limit
        
                const skip = (page - 1) * limit; // Calculate how many documents to skip
        
                const result = await jobsCollection.find().skip(skip).limit(limit).toArray();
        
                if (result.length > 0) {
                    res.status(200).send({
                        data: result,
                        pagination: {
                            currentPage: page,
                            totalPages: totalPages,
                            totalJobs: totalJobs,
                        },
                    });
                } else {
                    res.status(404).send({ message: 'No jobs found for this page!' });
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

        // GET /jobs/applied-by-email/:email
        app.get('/jobs/applied-by-email/:email', async (req, res) => {
            try {
                const email = req.params.email;

                // Query the database for jobs where appliedPersonInformation contains the email
                const query = {
                    appliedPersonInformation: {
                        $elemMatch: { email: email }
                    }
                };

                const result = await jobsCollection.find(query).toArray();

                if (result && result.length > 0) {
                    res.status(200).json(result); // Return the list of jobs
                } else {
                    res.status(404).json({ message: 'No jobs found for the given email' });
                }
            } catch (error) {
                console.error("Error fetching jobs by email:", error);
                res.status(500).json({ message: 'Internal server error' });
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
                console.log(newJob)
                const result = await jobsCollection.insertOne(newJob);
                console.log(result);

                if (result.acknowledged) {
                    res.status(201).send(result);
                } else {
                    res.status(400).send({ success: false, message: 'Failed to insert job' });
                }
            } catch (error) {
                console.error("Error posting job:", error); // Log the error for debugging
                res.status(500).send({ success: false, message: 'Internal server error' });
            }
        });

        app.delete('/jobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await jobsCollection.deleteOne(query);

                if (result.deletedCount > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ success: false, message: 'Job not found' });
                }
            } catch (error) {
                res.status(500).send({ success: false, message: 'Internal server error' });
            }
        });

        // applied job's related API's

        // GET /applied-jobs/:userId
        app.get('/applied-jobs/:userId', async (req, res) => {
            try {
                const userId = req.params.userId;

                if (!ObjectId.isValid(userId)) {
                    // Validate ObjectId for userId if needed
                    return res.status(400).send({ message: 'Invalid user ID format' });
                }

                const query = { userId: userId };
                const result = await appliedJobsCollection.find(query).toArray();

                if (result.length > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'Applied jobs not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Internal server issue' });
            }
        });

        // POST /applied-jobs
        app.post('/applied-jobs', async (req, res) => {
            try {
                const { userId, jobId, jobCompany, jobPosition, fullName, email, phone, resume, coverLetter } = req.body;

                if (!userId || !jobId) {
                    return res.status(400).json({ message: "Missing required fields" });
                }

                // Check if the job is already saved by the same user
                const existingAppliedJob = await appliedJobsCollection.findOne({ userId, jobId });

                if (existingAppliedJob) {
                    return res.status(409).send({ message: 'Job is already applied by this user' });
                }

                const newApplication = {
                    userId,
                    jobId,
                    jobCompany,
                    jobPosition,
                    fullName,
                    email,
                    phone,
                    resume,
                    coverLetter,
                    appliedAt: new Date(),
                };

                const result = await appliedJobsCollection.insertOne(newApplication);

                if (result.acknowledged) {
                    res.status(200).json({ message: "Application submitted successfully", applicationId: result.insertedId });
                } else {
                    res.status(500).send({ message: 'Failed to applied the job' });
                }
            } catch (error) {
                console.error("Error saving job application:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });

        // DELETE /applied-jobs
        app.delete('/applied-jobs/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await appliedJobsCollection.deleteOne(query);

                if (result.deletedCount > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'Applied job is not found' });
                }
            } catch (error) {
                console.error("Error deleting applied job:", error);
                res.status(500).send({ message: 'Internal Server Issue' });
            }
        });

        // save job's related API's

        // GET /saved-jobs/:userId
        app.get('/saved-jobs/:userId', async (req, res) => {
            try {
                const userId = req.params.userId;

                // Validate ObjectId for userId if needed
                if (!ObjectId.isValid(userId)) {
                    return res.status(400).send({ message: 'Invalid user ID format' });
                }

                const query = { userId: userId }; // Query to find all jobs saved by this user
                const result = await saveJobsCollection.find(query).toArray();

                if (result && result.length > 0) {
                    res.status(200).send(result); // Send all saved jobs for this user
                } else {
                    res.status(404).send({ message: 'No saved jobs found for this user' });
                }
            } catch (error) {
                console.error('Error fetching saved jobs:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

        // POST /saved-jobs
        app.post('/saved-jobs', async (req, res) => {
            try {
                const { userId, jobId, jobCategory, jobCompany, jobLogo, jobLocation, jobPosition } = req.body;

                // Validate inputs
                if (!ObjectId.isValid(userId) || !jobId) {
                    return res.status(400).send({ message: 'Invalid user ID or job ID format' });
                }

                // Check if the job is already saved by the same user
                const existingJob = await saveJobsCollection.findOne({ userId, jobId });

                if (existingJob) {
                    return res.status(409).send({ message: 'Job is already saved by this user' });
                }

                // Save the job
                const savedJob = { userId, jobId, jobCategory, jobCompany, jobLogo, jobLocation, jobPosition };
                const result = await saveJobsCollection.insertOne(savedJob);

                if (result.insertedId) {
                    res.status(201).send({ message: 'Job saved successfully', savedJob });
                } else {
                    res.status(500).send({ message: 'Failed to save job' });
                }
            } catch (error) {
                console.error('Error saving job:', error);
                res.status(500).send({ message: 'Internal Server Error' });
            }
        });

        // DELETE /saved-jobs
        app.delete('/saved-jobs/:savedJobId', async (req, res) => {
            try {
                const jobId = req.params.savedJobId; // Corrected the parameter name
                const query = { _id: new ObjectId(jobId) };
                const result = await saveJobsCollection.deleteOne(query);

                if (result.deletedCount > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'Job not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Internal server error', error });
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
                const query = { email: email };
                const result = await usersCollection.findOne(query);

                if (result) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ message: 'User data not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Failed to fetch user data' });
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

        app.patch('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const updatedDoc = {
                    $set: {
                        role: req.body.role
                    }
                };

                const result = await usersCollection.updateOne(filter, updatedDoc);

                if (result.modifiedCount === 1) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send(`User with id: ${id} not found`);
                }
            } catch (error) {
                res.status(500).send(`An error occurred: ${error.message}`);
            }
        })

        app.delete('/users/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await usersCollection.deleteOne(query);

                if (result.deletedCount > 0) {
                    res.status(200).send(result);
                } else {
                    res.status(404).send({ success: false, message: 'User not found' });
                }
            } catch (error) {
                res.status(500).send({ success: false, message: 'Internal server error' });
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
