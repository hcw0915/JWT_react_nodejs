# JWT with NodeJS & React

### 目的

主要配合 JWT 執行 帳號密碼驗證，個別執行 accessToken/refreshToken 的過程與實作。
後端部分可以配合 postman 進行 API 測試

- POST: `localhost:5000/api/login`

  ```javascript
  // body
  {
    "username": "john",
    "password": "123"
  }
  // return
  {
    "username": "...",
    "isAdmin": "...",
    "accessToken": "...",
    "refreshToken": "...",
  }
  ```

- POST: `localhost:5000/api/refresh`

  ```javascript
  // body
  {
  	"token": "..."
  }

  // return
  {
    "accessToken": "...",
    "refreshToken": "..."
  }
  ```

- DELETE: `localhost:5000/api/users/<userId>`
- POST: `localhost:5000/api/logout`

---

### Server / Client

- Server -> `npm install` -> `npm start`
- Client -> `npm install` -> `npm run dev`

```json
[
	{
		"id": "1",
		"username": "john",
		"password": "123"
	},
	{
		"id": "2",
		"username": "jane",
		"password": "123"
	}
]
```

---

### Axios

- 配合 Axios interceptors 針對 refresh token updated 做一個獨立的 middleware 處理。

```javascript
const axiosJWT = axios.create()
axiosJWT.interceptors.request.use(
	// do sth
	async (config) => {
		let currentDate = new Date()
		const decodedToken = jwtDecode(user.accessToken)
		if (decodedToken.exp * 1000 < currentDate.getTime()) {
			const data = await refreshToken()
			config.headers['authorization'] = 'Bearer ' + data.accessToken
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)
```
