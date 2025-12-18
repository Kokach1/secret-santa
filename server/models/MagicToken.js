
const { db } = require('../config/firebase');

class MagicToken {
    static collection = db.collection('magic_tokens');

    static async create(data) {
        await this.collection.add({
            ...data,
            createdAt: new Date()
        });
    }

    static findOne(query) {
        let ref = this.collection;
        for (const [key, value] of Object.entries(query)) {
            ref = ref.where(key, '==', value);
        }

        return {
            sort: (sortObj) => {
                const [field, dir] = Object.entries(sortObj)[0];
                ref = ref.orderBy(field, dir === -1 ? 'desc' : 'asc');
                return {
                    then: (resolve, reject) => {
                        ref.limit(1).get().then(snapshot => { // findOne implies limit 1
                            if (snapshot.empty) resolve(null);
                            else resolve({ _id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
                        }).catch(reject);
                    }
                };
            }
        }
    }

    static async deleteMany(query) {
        const snapshot = await this.collection.where('email', '==', query.email).get();
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
    }
}

module.exports = MagicToken;
