const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const OFFICIAL_EMAIL = "your_email@chitkara.edu.in";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE";

// --- Logic Helpers ---
const getFibonacci = (n) => {
    let sequence = [0, 1];
    for (let i = 2; i < n; i++) sequence.push(sequence[i - 1] + sequence[i - 2]);
    return sequence.slice(0, n);
};

const isPrime = (num) => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) if (num % i === 0) return false;
    return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const getLCM = (arr) => arr.reduce((a, b) => (a * b) / gcd(a, b));
const getHCF = (arr) => arr.reduce((a, b) => gcd(a, b));

// --- API Endpoints ---

// POST /bfhl
app.post('/bfhl', async (req, res) => {
    try {
        const keys = Object.keys(req.body);
        if (keys.length !== 1) {
            return res.status(400).json({ is_success: false, official_email: OFFICIAL_EMAIL, error: "Exactly one key required" });
        }

        const key = keys[0];
        const val = req.body[key];
        let responseData;

        switch (key) {
            case 'fibonacci':
                responseData = getFibonacci(parseInt(val));
                break;
            case 'prime':
                responseData = val.filter(n => isPrime(parseInt(n)));
                break;
            case 'lcm':
                responseData = getLCM(val.map(Number));
                break;
            case 'hcf':
                responseData = getHCF(val.map(Number));
                break;
            case 'AI':
                const aiRes = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    contents: [{ parts: [{ text: `Provide a single-word answer for: ${val}` }] }]
                });
                responseData = aiRes.data.candidates[0].content.parts[0].text.trim().replace(/[^\w]/g, '');
                break;
            default:
                return res.status(400).json({ is_success: false, official_email: OFFICIAL_EMAIL, error: "Invalid key provided" });
        }

        res.status(200).json({ is_success: true, official_email: OFFICIAL_EMAIL, data: responseData });
    } catch (error) {
        res.status(500).json({ is_success: false, official_email: OFFICIAL_EMAIL, error: "Internal Server Error" });
    }
});

// GET /health
app.get('/health', (req, res) => {
    res.status(200).json({ is_success: true, official_email: OFFICIAL_EMAIL });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));