
const { db } = require('../config/firebase');

class Settings {
    static collection = db.collection('settings');
    static docId = 'global_config'; // Single document for settings

    static async findOne(query) {
        // Ignore query for now because we only have one settings doc
        const doc = await this.collection.doc(this.docId).get();
        if (!doc.exists) return null;
        return { _id: doc.id, ...doc.data() };
    }

    static async findOneAndUpdate(query, update, options) {
        // Standardize document ID
        const docRef = this.collection.doc(this.docId);

        // Handle Upsert
        if (options.upsert) {
            await docRef.set(update, { merge: true });
        } else {
            await docRef.update(update);
        }

        const doc = await docRef.get();
        return { _id: doc.id, ...doc.data() };
    }
}

module.exports = Settings;
