import mongoose from "mongoose";
import { Node } from "db/client";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/n8n-clone";

async function seed() {
    console.log("Connecting to DB...");
    await mongoose.connect(MONGO_URI);
    
    console.log("Clearing old nodes (if any)...");
    await Node.deleteMany({});
    
    const nodes = [
        { title: "timer", description: "Trigger workflow at an interval", type: "TRIGGER" },
        { title: "webhook", description: "Trigger on incoming HTTP", type: "TRIGGER" },
        { title: "schedule", description: "Trigger on cron schedule", type: "TRIGGER" },
        { title: "http-request", description: "Make an API call", type: "ACTION" },
        { title: "mail", description: "Send an email (SMTP)", type: "ACTION" }
    ];

    await Node.insertMany(nodes);
    console.log("✅ Successfully seeded the nodes collection!");
    process.exit(0);
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
