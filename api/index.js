const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { google } = require('googleapis');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Google Sheets Auth
const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Routes
app.get('/', (req, res) => {
    res.send('MOU Draft Service API is Running');
});

app.get('/api', (req, res) => {
    res.send('MOU Draft Service API is Running');
});

// Endpoint to save user data
app.post('/api/save-user', async (req, res) => {
    try {
        const { name, phone, email, date, role } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and Phone are required' });
        }

        if (!SPREADSHEET_ID) {
            console.error('SPREADSHEET_ID is missing in .env');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const formattedDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const values = [[formattedDate, name, phone, email || '', role || '']];

        const resource = {
            values,
        };

        const result = await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:E',
            valueInputOption: 'USER_ENTERED',
            resource,
        });

        console.log(`User saved: ${name}, ${phone}`);
        res.status(200).json({ message: 'User saved successfully', data: result.data });

    } catch (error) {
        console.error('Error saving to Google Sheets:', error);
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// Start server if running directly (npm run dev)
// Vercel handles this automatically, but we need this for local dev
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

// Export the app for Vercel
module.exports = app;
