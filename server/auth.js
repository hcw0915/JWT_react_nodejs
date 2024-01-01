const jwt = require('jsonwebtoken')

function generateAccessToken(user, isRefresh = '') {
	return jwt.sign(
		{ id: user.id, isAdmin: user.isAdmin },
		isRefresh === 'refresh' ? 'myRefreshSecretKey' : 'mySecretKey',
		isRefresh !== 'refresh' && { expiresIn: '5s' }
	)
}

function verify(req, res, next) {
	const authHeader = req.headers.authorization
	if (authHeader) {
		const token = authHeader.split(' ')[1] // "Bearer <token>"

		jwt.verify(token, 'mySecretKey', (err, user) => {
			if (err) {
				return res.status(403).json('Token is not valid!')
			}

			req.user = user
			next()
		})
	} else {
		res.status(401).json('You are not authenticated!')
	}
}

module.exports = { generateAccessToken, verify }
