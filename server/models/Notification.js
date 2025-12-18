
const { db } = require('../config/firebase');

class Notification {
    static collection = db.collection('notifications');

    static async create(data) {
        const docRef = await this.collection.add({
            ...data,
            createdAt: new Date()
        });
        return { _id: docRef.id, ...data };
    }

    static find(query) {
        let ref = this.collection;
        // Basic query support
        for (const [key, value] of Object.entries(query)) {
            ref = ref.where(key, '==', value);
        }

        return {
            sort: (sortObj) => {
                const [field, dir] = Object.entries(sortObj)[0];
                ref = ref.orderBy(field, dir === -1 ? 'desc' : 'asc');
                return this; // Chain
            },
            then: (resolve, reject) => {
                ref.get().then(snapshot => {
                    const results = snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
                    resolve(results);
                }).catch(reject);
            }
        };
    }
}

module.exports = Notification;
