const http = require('http')
const axios = require('axios')
const httpProxy = require('http-proxy')

const proxy = httpProxy.createProxyServer();
proxy.on('proxyRes', (proxyRes, req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080')
})
http.createServer(async (req, res) => {
  if (req.url && req.url.startsWith('/api/private') && req.method !== 'OPTIONS') {
    const isValid = await validateToken(req.headers.authorization)
    if (!isValid) {
      res.statusCode = 401
      res.write(JSON.stringify({message: 'Unauthorized'}))
      res.end()
      return
    }
  }
  proxy.web(req, res, {target: 'http://api:3000'})
}).listen(3030, () => console.log('Proxy server started!'));

const validateToken = async (token) => {
  if (token === undefined) {
    console.log('token is undefined')
    return false
  }
  const params = new URLSearchParams()
  params.append('token', token.substring(7))
  params.append('token_hint', 'access_token')
  params.append('client_id', 'app-vue-gateway')
  params.append('client_secret', 'uYiuLnIWX4P7HTctXyQ7P8dzr5xXbF06')
  try {
    const res = await axios.post('http://keycloak:8080/auth/realms/testrealm/protocol/openid-connect/token/introspect', params,{headers:{Host:'localhost:18080'}})
    if (res.status === 200 && res.data.active === true) {
      return true
    }
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      console.log(e.message)
    }
    return false
  }
  return false
}