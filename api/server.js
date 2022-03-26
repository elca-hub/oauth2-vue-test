const express = require('express')
const cors = require('cors')
const axios = require('axios')

const app = express()

app.use(cors())

const port = 3000

app.get('/api/mes', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  const data = {
    mes: 'Hello world from api server!'
  }
  res.json(data)
})

app.get('/api/private', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  const data = {
    mes: 'this message is private'
  }
  res.json(data)
})

app.listen(port, () => console.log('Server started!'))