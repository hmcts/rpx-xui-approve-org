import * as process from 'process'
import { app } from './application'
import * as log4jui from './lib/log4jui'
const logger = log4jui.getLogger('server')

const port = process.env.PORT || 3001
app.listen(port, () => logger.info(`Local server up at ${port}`))
