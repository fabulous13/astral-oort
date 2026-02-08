
import mongoose from 'mongoose';

const uri = "mongodb+srv://cabineteia_db_user:xZH5njGdSxfp84B2@cluster0.avnsvc7.mongodb.net/truth_ai?appName=Cluster0";

console.log("Attempting to connect to MongoDB...");

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB!");
        console.log("Checking for existing users...");
        mongoose.connection.db.collection('users').find().toArray()
            .then(users => {
                console.log(`Found ${users.length} users.`);
                console.log(users);
                process.exit(0);
            })
            .catch(err => {
                console.error("Error reading users:", err);
                process.exit(1);
            });
    })
    .catch(err => {
        console.error("FAILURE: Could not connect to MongoDB.");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        if (err.message.includes("bad auth")) {
            console.log("Hint: Password might be incorrect or user does not exist.");
        } else if (err.message.includes("SSL")) {
            console.log("Hint: Network/SSL issue.");
        }
        process.exit(1);
    });
