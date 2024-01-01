const express = require('express')
const jwt = require('jsonwebtoken')
const app = express()
app.use(express.json())

const { generateAccessToken, verify } = require('./auth')
const { users } = require('./database')

/**
 *
 * 最開始的 login 拿到兩個 token (access/refresh)
 * 都有設定 expiresIn 時間
 * 要在 accessToken 過期之前 用 refreshToken 去拿最新的 token (access/refresh)
 *
 */

let refreshTokens = []
// Refresh tokens
app.post('/api/refresh', (req, res) => {
	// take the refresh token from the user
	const refreshToken = req.body.token

	// send error if there is no token or it's invalid
	if (!refreshToken) return res.status(401).json('You are not authenticated!')
	if (!refreshTokens.includes(refreshToken)) {
		return res.status(403).json('Refresh token is invalid!')
	}

	jwt.verify(refreshToken, 'myRefreshSecretKey', (err, user) => {
		err && console.log(err)
		refreshTokens = refreshTokens.filter((token) => token !== refreshToken)
		const newAccessToken = generateAccessToken(user)
		const newRefreshToken = generateAccessToken(user, 'refresh')

		refreshTokens.push(newRefreshToken)

		res.status(200).json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken
		})
	})
	// if everything is ok, create new access token and send to user
})

console.log(refreshTokens)

// Login
app.post('/api/login', (req, res) => {
	const { username, password } = req.body
	const user = users.find((u) => {
		return u.username === username && u.password === password
	})
	if (user) {
		// Generate an access token
		const accessToken = generateAccessToken(user)
		const refreshToken = generateAccessToken(user, 'refresh')

		refreshTokens.push(refreshToken)
		res.json({
			username: user.username,
			isAdmin: user.isAdmin,
			accessToken,
			refreshToken
		})
	} else {
		res.status(400).json('Username or password incorrect!!')
	}
})

// api __verify(middleware)__cb  => 經過 middleware 驗證 jwt token  => 在回到 delete 這個後面的 cb
app.delete('/api/users/:userId', verify, (req, res) => {
	if (req.user.id === req.params.userId || req.user.isAdmin) {
		res.status(200).json('User has been deleted.')
	} else {
		res.status(403).json('You are not allowed to delete this user!')
	}
})

app.post('/api/logout', verify, (req, res) => {
	const refreshToken = req.body.token
	refreshTokens = refreshTokens.filter((token) => token !== refreshToken)
	res.status(200).json('You logged out successfully!')
})

app.listen(5000, () => {
	console.log('backend server is running')
})
