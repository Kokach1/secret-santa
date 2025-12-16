const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function debugSantaChain() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        // 1. Find a pair (Any student who has a 'paired_to')
        const santa = await User.findOne({ paired_to: { $ne: null }, role: 'student' });

        if (!santa) {
            console.log("No pairs found in DB! Cannot debug.");
            return;
        }

        const childId = santa.paired_to;
        const child = await User.findById(childId);

        console.log(`\n🎅 TEST PAIR FOUND:`);
        console.log(`Santa: ${santa.email} (${santa._id})`);
        console.log(`Child: ${child ? child.email : 'UNKNOWN'} (${childId})`);

        // 2. Simulate Updating Santa's Progress
        console.log(`\n📝 Updating Santa's progress...`);
        santa.progress = { gift_ready: true, gift_delivered: true, gift_received: false };
        await santa.save();
        console.log("Santa progress saved: ", santa.progress);

        // 3. Simulate Child Fetching "My Santa" (GET /me logic)
        // expected query: User.findOne({ paired_to: child._id })
        console.log(`\n🔍 Child querying for their Santa...`);

        const foundSanta = await User.findOne({ paired_to: child._id });

        if (!foundSanta) {
            console.log("❌ FAILURE: Child could not find their Santa in DB query!");
            console.log(`Query ran: { paired_to: ${child._id} }`);
        } else {
            if (foundSanta._id.toString() === santa._id.toString()) {
                console.log("✅ SUCCESS: Child found the correct Santa.");
                console.log("Santa Progress visible to child:", foundSanta.progress);
            } else {
                console.log("❌ MISMATCH: Child found a DIFFERENT Santa:", foundSanta.email);
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

debugSantaChain();
