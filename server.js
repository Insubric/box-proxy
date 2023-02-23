const express = require('express')
const { createProxyMiddleware } = require('http-proxy-middleware');

const config = require('./config.json');

const app = express()



for (let [name, url] of Object.entries(config.apps)) {
    console.log(`Installed app /${name} => ${url}`)
    const pathRewrite = {}
    pathRewrite['^/' + name] = ''
    const router = express.Router();
    router.all(`/*`, createProxyMiddleware({
        target: url,
        changeOrigin: true,
        logLevel: config.log_level,
        pathRewrite: pathRewrite,
        onError(err, req, res) {
          console.error(err);
        }
      }));
    
    app.use(`/${name}`, router);

}

// router.all(`/*`, createProxyMiddleware({
//     target: config.apps[config.default_app],
//     changeOrigin: true,
//     logLevel: config.log_level,
//     onError(err, req, res) {
//       console.error(err);
//     }
//   }));



app.listen(config.port, () => {
    console.log(`Box proxy listening on port ${config.port}`)
})