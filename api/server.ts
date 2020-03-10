import * as ejs from 'ejs'
import * as express from 'express'
import * as path from 'path'
import * as process from 'process'
import { app } from './application'
import { appInsights } from './lib/appInsights'


app.engine('html', ejs.renderFile)
app.set('view engine', 'html')
app.set('views', __dirname)

app.use(express.static(path.join(__dirname, '..', 'assets'), { index: false }))
app.use(express.static(path.join(__dirname, '..'), { index: false }))

app.use(appInsights)

app.use('/*', (req, res) => {
    console.time(`GET: ${req.originalUrl}`)
    res.render('../index', {
        providers: [
            { provide: 'REQUEST', useValue: req },
            { provide: 'RESPONSE', useValue: res },
        ],
        req,
        res,
    })
    console.timeEnd(`GET: ${req.originalUrl}`)
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log('server running on port:', port) )
