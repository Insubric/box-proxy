const express = require('express')

const app = express()

const port = 8882

app.get('/test', (req, res) => {
    console.log(req.headers)
    res.send("ok")
})

app.listen(port, () => {
    console.log(`Box debug listening on port ${port}`)
})