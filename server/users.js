import { connectToDB } from "./database.js";

export const addUser = async ({ id, name, room, myCards }) => {
  console.log("denging new user");
  try {
    const usersCollection = await connectToDB(); // Connect to the database
    const numberOfUsersInRoom = usersCollection.countDocuments({ room });

    if (numberOfUsersInRoom === 2) return { error: "Room full" };

    const newUser = { id, name, room, myCards };
    const newUserDB = await usersCollection.insertOne(newUser);
    console.log(`An user is inserted with the _id: ${newUserDB.insertedId}`);
    return { newUser };
  } catch (error) {
    console.error("Error adding user:", error);
    return { error: "Failed to add user" };
  }
};

export const removeUser = async (id) => {
  try {
    const usersCollection = await connectToDB(); // Connect to the database
    const deletionResult = await usersCollection.deleteOne({ id: id });

    if (deletionResult.deletedCount === 1) {
      console.log(`User with id ${id} is removed from the database`);
      return { success: true };
    } else {
      console.log(`User with id ${id} is not found in the database`);
      return { success: false, error: "User not found" };
    }
  } catch (error) {
    console.error("Error removing user:", error);
    return { success: false, error: "Failed to remove user" };
  }
};

export const getUser = async (id) => {
  const collection = await connectToDB();
  const users = await collection.find({ id: id }).toArray();
  return users[0];
};

export const getUsersInRoom = async (room) => {
  const collection = await connectToDB();
  const users = await collection.find({ room: room }).toArray();
  console.log("getting users in room", users);
  return users;
};

export const updateCards = async (
  firstUser,
  secondUser,
  user1Cards,
  user2Cards
) => {
  const collection = await connectToDB();
  console.log("update myCards in db");
  console.log(firstUser, secondUser, user1Cards, user2Cards);
  collection.updateOne({ id: firstUser.id }, { $set: { myCards: user1Cards } });
  collection.updateOne(
    { id: secondUser.id },
    { $set: { myCards: user2Cards } }
  );
};

// const users = [];

// export const addUser = ({ id, name, room, myCards }) => {
//   const numberOfUsersInRoom = users.filter((user) => user.room === room).length;
//   if (numberOfUsersInRoom === 2) return { error: "Room full" };

//   const newUser = { id, name, room, myCards };
//   users.push(newUser);
//   return { newUser };
// };

// export const removeUser = (id) => {
//   const removeIndex = users.findIndex((user) => user.id === id);

//   if (removeIndex !== -1) return users.splice(removeIndex, 1)[0];
// };

// export const getUser = (id) => {
//   return users.find((user) => user.id === id);
// };

// export const getUsersInRoom = (room) => {
//   return users.filter((user) => user.room === room);
// };

// // Import MongoDB client
// import { MongoClient } from "mongodb";

// // MongoDB connection URI
// const uri = "mongodb://localhost:27017"; // Change this URI according to your MongoDB setup

// // Database Name
// const dbName = "test"; // Change this to your database name

// // Collection Name
// const collectionName = "users"; // Change this to your collection name

// // Function to connect to MongoDB
// async function connectToMongoDB() {
//   const client = new MongoClient(uri, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   try {
//     await client.connect();
//     const db = client.db(dbName);
//     const col = await db.createCollection(collectionName);
//     return col;
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     throw error;
//   }
// }

// // Function to add a user to MongoDB
// export const addUser = async ({ id, name, room, myCards }) => {
//   const collection = await connectToMongoDB();
//   const numberOfUsersInRoom = await collection.countDocuments({ room });

//   if (numberOfUsersInRoom === 2) return { error: "Room full" };

//   const newUser = { id, name, room, myCards };
//   await collection.insertOne(newUser);
//   return { newUser };
// };

// // Function to remove a user from MongoDB
// export const removeUser = async (id) => {
//   const collection = await connectToMongoDB();
//   return await collection.findOneAndDelete({ id });
// };

// // Function to get a user from MongoDB by id
// export const getUser = async (id) => {
//   const collection = await connectToMongoDB();
//   return await collection.findOne({ id });
// };

// // Function to get users in a room from MongoDB
// export const getUsersInRoom = async (room) => {
//   const collection = await connectToMongoDB();
//   return await collection.find({ room }).toArray();
// };
