// server.js
const express = require('express')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

app.post('/check', (req, res) => {
	const { url } = req.body
	console.log(`[Dummy] check request for ${url}`)

	// flip a coin (50% chance)
	const allow = Math.random() < 0.5

	setTimeout(() => {
		console.log(`[Dummy] respond allow=${allow}`)
		res.json({ allow })
	}, 5000 * Math.random())
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
	console.log(`🟢 Dummy blocker server running on http://localhost:${PORT}`)
})
