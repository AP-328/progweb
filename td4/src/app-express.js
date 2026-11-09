/* global process */

import { MongoClient, ObjectId } from 'mongodb';
import express from 'express';
import morgan from 'morgan';

process.loadEnvFile('../.env');


const HOST = process.env.HOST;
const PORT = process.env.PORT;
const DATABASE_NAME = process.env.DATABASE_NAME;
const COLLECTION = process.env.COLLECTION;
const MONGO_URL = process.env.MONGO_URL;

const app = express();

let contacts = null;
let db = null;
let contactsArray = null;


app.use(morgan('combined'));

// allows the use of CSS from EJS files
app.use(express.static('views'));


await init();

async function init() {
    const client = new MongoClient(MONGO_URL);
    let connection = await client.connect();
    db = connection.db(DATABASE_NAME);
    await refreshContacts();
}

async function refreshContacts() {
    contacts = db.collection(COLLECTION);
    contactsArray = await contacts.find().toArray();
}


app.set('view engine', 'ejs');


/* app.get('/', (_req, res) => {
    res.send('Hello !');
}); */

app.get('/', (_req, res) => {
    res.render('root');
});


app.get('/home', (_req, res) => {
    res.send('Maison :-)');
});


app.get('/contact/:id', async (req, res) => {
    try {
        const contact = await contacts.findOne({ _id: new ObjectId(req.params.id) });

        contacts.findOne({ _id: new ObjectId(req.params.id) }).then((reponse) => {
            if (reponse) {
                res.render('contact', { contact: reponse });
            } else {
                res.status(404).send('Contact non trouvé !');
            }
        });
    } catch (error) {
        if (error.name === 'BSONError') {
            res.status(404).send('Identifiant mal formé !');
        } else {
            res.status(500).send('Erreur serveur !');
        }
    }
});


app.get('/contacts', async (_req, res) => {
    await refreshContacts();
    res.render('contacts', {
        /* contacts: contactsArray */
        contacts: contactsArray
    });
});


app.get('/contacts/new', (_req, res) => {
    res.render('newcontact');
});


app.get('/remove/:id', (req, res) => {
    try {
        contacts.deleteOne({ _id: new ObjectId(req.params.id) }).then((response) => {
            if (response.deletedCount !== 0) {
                res.redirect('/contacts');
            } else {
                res.status(404).send('Contact non trouvé !');
            }
        });
    } catch (error) {
        if (error.name === 'BSONError') {
            res.status(404).send('Identifiant mal formé !');
        } else {
            res.status(500).send('Erreur serveur !');
        }
    }
});


app.use((_req, res) => {
    res.status(404).send('Page introuvable !');
});


app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
