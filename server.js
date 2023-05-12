const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const basicAuth = require('express-basic-auth')

const config = require('./config.json');

const app = express()



for (let [name, service] of Object.entries(config.apps)) {
    console.log(`Installed app /${name} => ${service.target}`)
    const pathRewrite = {}
    pathRewrite['^/' + name] = ''
    const router = express.Router();
    router.all(`/*`, createProxyMiddleware({
        target: service.target,
        changeOrigin: true,
        logLevel: config.log_level,
        pathRewrite: pathRewrite,
        onError(err, req, res) {
          console.error(err);
        }
      }));
    if(service.users) {
        app.use(`/${name}`,basicAuth({
            users: service.users,
            challenge: true
        }),router)
    } else {
        app.use(`/${name}`, router);
    }

}

app.get('/', (req, res) => {
          res.redirect(303, `/${config.default_app}`);      
})

app.listen(config.port, () => {
    console.log(`Box proxy listening on port ${config.port}`)
})