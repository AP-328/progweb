/* global process */

import { MongoClient } from 'mongodb';

process.loadEnvFile('../.env');

const DATABASE_NAME = process.env.DATABASE_NAME;
const COLLECTION = process.env.COLLECTION;
const MONGO_URL = process.env.MONGO_URL;

async function printAllContacts(collection) {
    const results = await collection.find().toArray();
    for (const result of results) {
        console.log(`Contact : ${result.name} is ${result.age}`);
    }
}

async function main() {
    let connection = null;
    try {
        console.log('Trying to connect...');
        const client = new MongoClient(MONGO_URL);
        /* , {
           useNewUrlParser: true
       });*/
        connection = await client.connect();
        console.log('Successfully connected to MongoDB.');
        const db = connection.db(DATABASE_NAME);
        const contacts = db.collection(COLLECTION);
        await printAllContacts(contacts);
    } catch (e) {
        console.error(e);
    } finally {
        if (connection) {
            connection.close();
        }
    }
}

main();
