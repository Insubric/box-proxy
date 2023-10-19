const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const basicAuth = require('express-basic-auth')

const config = require('./config.json');

const app = express()

const hasRoot = Object.keys(config.apps).includes("/")

const base = config.base ?  config.base : ''

for (let [name, service] of Object.entries(config.apps)) {
    console.log(`Installed app /${name} => ${service.target}`)
    const pathRewrite = {}
    if(name !== "/")
        pathRewrite['^/' + name] = ''
    else
        pathRewrite['^/'] = ''
    const router = express.Router();
    router.all(`/*`, createProxyMiddleware({
        target: service.target,
        changeOrigin: true,
        xfwd: true,
        autoRewrite: true,
        logLevel: config.log_level,
        pathRewrite: pathRewrite,
        onError(err, req, res) {
          console.error(err);
        },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('X-Forwarded-Path', `${base}/${name}`);
        },
      }));

    const url = name === "/" ? "/" : `/${name}`

    if(service.users) {
        app.use(url,basicAuth({
            users: service.users,
            challenge: true
        }),router)
    } else {
        app.use(url, router);
    }

}



if(!hasRoot) {
    app.get('/', (req, res) => {
        res.redirect(303, `${base}/${config.default_app}/`);
    })
}

app.listen(config.port, () => {
    console.log(`Box proxy listening on port ${config.port}`)
})