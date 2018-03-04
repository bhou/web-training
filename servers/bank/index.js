const fs = require('fs');
const express = require('express')
const cookieParser = require('cookie-parser')
const app = express()
app.use(cookieParser())

app.use('/', express.static('public'))

var total = 1000000.30
const sessionId = 'the-id-you-cant-guess'

app.get('/', (req, res) => {
	const id = req.cookies.id
	if (!id || id != sessionId) {
		return res.redirect('/login.html')
	}
	fs.readFile( __dirname + '/public/account.html', function (err, data) {
		if (err) {
			res.end(err) 
		}
		content = data.toString().replace('__TOTAL__', total)
		res.end(content)
	});
})

app.get('/api/login', (req, res) => {
	res.cookie('id', sessionId)
	res.end('ok')
})

app.get('/api/logout', (req, res) => {
	res.clearCookie('id')
	res.end('ok')
})

app.get('/debug/cookies', (req, res) => {
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Access-Control-Allow-Origin', 'http://mybank.com')
	res.end(JSON.stringify(req.cookies))
})

app.get('/test/simple/cors/notallowed', (req, res) => {
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Access-Control-Allow-Origin', 'http://mybank.com')
	res.end(JSON.stringify({message: 'Hello World'}))
})
app.get('/test/simple/cors/allowed', (req, res) => {
	res.setHeader('Content-Type', 'application/json')
	res.setHeader('Access-Control-Allow-Origin', '*')
	res.end(JSON.stringify({message: 'Hello World'}))
})



app.get('/api/account', (req, res) => {
	const id = req.cookies.id
	if (!id || id != sessionId) {
		res.status(401)
		return res.end('Unauthorized')
	}
	
	// res.setHeader('Access-Control-Allow-Origin', 'http://mybank.com')

	res.end('Your total: ' + total + ' euros')
})

const payHandler = (req, res) => {
	const id = req.cookies.id
	if (!id || id != sessionId) {
		res.status(401)
		return	res.end('Unauthorized')
	}

	var amount = req.param('amount')	
	if (!amount) {
		amount = 0
	}
	if (total < amount) {
		res.status(400)
		return res.end('You don\'t have enough money!')
	}
	total -= amount
	return res.end('ok')
}

app.get('/api/pay', payHandler)
app.post('/api/pay', payHandler)
app.put('/api/pay', payHandler)

app.listen(3000, () => console.log('Example app listening on port 3000!'))
