//setup

const express = require('express');
const fs = require('fs');
const path = require('path');
const uuid = require('./helpers/uuid');

const app = express();
const PORT = 3001;

//middleware

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//routes

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/api/notes', (req, res) => {
    fs.readFile(path.join(__dirname, 'db/db.json'), 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read notes' });
        }
        try {
            const notes = JSON.parse(data);
            res.json(notes);
        } catch (parseError) {
            console.error(parseError);
            res.status(500).json({ error: 'Failed to parse notes'});
        }
    });
});

app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;

    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid(),
        };

        fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to read notes' });
            }

            const notes = JSON.parse(data);
            notes.push(newNote);

            fs.writeFile(path.join(__dirname, 'db/db.json'), JSON.stringify(notes), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to save note' });
                }
                console.log(`New note for ${newNote.title} added`);
                res.status(201).json(newNote);
            });
        });

    } else {
        res.status(500).json('Error in posting note')
    }
});

app.listen(PORT, () =>
    console.log(`App listening at http://localhost:${PORT}`)
);