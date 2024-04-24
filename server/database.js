import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.MONGODB_URI;
export async function connectToDB() {
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  try {
    // Connect the client to the server
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("Cards").command({ ping: 1 });
    const database = client.db("Cards");
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // Get the list of collections
    const usersCollection = database.collection("users");
    return usersCollection;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
