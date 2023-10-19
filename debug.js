const express = require('express')

const app = express()

const port = 8882

app.get('/test', (req, res) => {
    console.log(req.headers)
    res.send("ok")
})

app.get('/redirect', (req, res) => {
    console.log(req.headers)
    res.redirect(303, `/test`);
})

app.listen(port, () => {
    console.log(`Box debug listening on port ${port}`)
})