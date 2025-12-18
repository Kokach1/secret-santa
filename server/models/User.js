
const { db } = require('../config/firebase'); // Destructure db from firebase

class User {
    static collection = db.collection('users');

    // Helper to format document
    static truncateDoc(doc) {
        if (!doc.exists) return null;
        const data = doc.data();
        return { _id: doc.id, ...data };
    }

    static async create(data) {
        // Check duplicate email
        const existing = await this.findOne({ email: data.email });
        if (existing) throw new Error('User already exists');

        const docRef = await this.collection.add({
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        const doc = await docRef.get();
        return this.truncateDoc(doc);
    }

    static async findOne(query) {
        let ref = this.collection;
        for (const [key, value] of Object.entries(query)) {
            ref = ref.where(key, '==', value);
        }
        const snapshot = await ref.limit(1).get();
        if (snapshot.empty) return null;
        return this.truncateDoc(snapshot.docs[0]);
    }

    static async findById(id) {
        const doc = await this.collection.doc(id).get();
        return this.truncateDoc(doc);
    }

    static async findByIdAndUpdate(id, update, options = {}) {
        await this.collection.doc(id).update({
            ...update,
            updatedAt: new Date()
        });
        if (options.new) {
            return this.findById(id);
        }
        return { _id: id }; // Approximate return
    }

    // Support for find({ role: 'student' }).sort(...) Mongoose chaining emulation
    // This is simplified; complex queries might need refactoring in the route handlers
    static find(query) {
        let ref = this.collection;
        for (const [key, value] of Object.entries(query)) {
            ref = ref.where(key, '==', value);
        }

        // Return a "Chainable" object to simulate mongoose .sort().limit() ...
        return new QueryBuilder(ref);
    }

    static async findByIdAndDelete(id) {
        await this.collection.doc(id).delete();
        return true;
    }

    // New Helper for Bulk Updates
    static async updateMany(query, update) {
        // Firestore doesn't support 'updateMany' natively efficiently, need build batch
        const snapshot = await this.find(query).get(); // Using our helper's get
        if (snapshot.empty) return;

        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.update(doc.ref, update['$set'] || update); // Handle $set or direct
        });
        await batch.commit();
    }

    // Special bulk write emulation for Pairing
    static async bulkWrite(ops) {
        const batch = db.batch();
        ops.forEach(op => {
            if (op.updateOne) {
                const { filter, update } = op.updateOne;
                // We assume filter is { _id: ... }
                const ref = this.collection.doc(filter._id);
                batch.update(ref, update['$set'] || update);
            }
        });
        await batch.commit();
    }
}

// Helper class to mimic Mongoose Query Chain
class QueryBuilder {
    constructor(queryRef) {
        this.queryRef = queryRef;
    }

    sort(sortObj) {
        // e.g. { createdAt: -1 }
        const [field, dir] = Object.entries(sortObj)[0];
        this.queryRef = this.queryRef.orderBy(field, dir === -1 ? 'desc' : 'asc');
        return this;
    }

    select() { return this; } // No-op for Firestore (returns whole doc usually)
    populate() { return this; } // No-op (Requires manual Join, will fix in Controller)

    async get() { // Internal helper
        return this.queryRef.get();
    }

    // To execute
    then(resolve, reject) {
        return this.queryRef.get()
            .then(snapshot => {
                const results = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
                resolve(results);
            })
            .catch(reject);
    }
}

module.exports = User;
