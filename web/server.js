const express = require('express')
const path = require('path')
const serveStatic = require('serve-static')
const history = require('connect-history-api-fallback')

const app = express()
app.use(history())
app.use(serveStatic(path.join(__dirname, 'dist')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

const port = 8080

app.listen(port, () => console.log(`Server started on port ${port}`))
