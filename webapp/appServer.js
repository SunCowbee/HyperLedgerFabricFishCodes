const express = require('express')
const app = express()
const queryFish = require('./appServerQueryFish')

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/queryAllFish',async (req, res) =>{ res.send(await queryFish.query("queryAllFish",""))})

app.listen(3002, () => console.log('Example app listening on port 3002!'))