const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');
const basicAuth = require('express-basic-auth')
const cors = require('cors');

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

    const url = name === "/" ? "/" : `/${name}`
    

    const router = express.Router();
    router.all(`/*`, createProxyMiddleware({
        target: service.target,
        changeOrigin: true,
        xfwd: true,
        autoRewrite: true,
        hostRewrite: true,
        logLevel: config.log_level,
        pathRewrite: pathRewrite,
        onError(err, req, res) {
          console.error(err);
        },
        onProxyReq: (proxyReq, req, res) => {
            proxyReq.setHeader('X-Forwarded-Path', `${base}/${name}`);
        },
        onProxyRes: (proxyRes, req, res) => {
            if (proxyRes.headers.location && proxyRes.headers.location.startsWith("/")) { 
                if (proxyRes.headers.location.startsWith(`/${name}`)) {
                    proxyRes.headers['location'] = `${base}${proxyRes.headers.location}`
                } else {
                    proxyRes.headers['location'] = `${base}/${name}${proxyRes.headers.location}`
                }
            }
        },
        cookiePathRewrite: service.cookiePathRewrite
      }));

    

    if(service.users) {
        app.use(url,basicAuth({
            users: service.users,
            challenge: true
        }),router)
    } else if(service.cors) {
        app.use(url, cors(), router);
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