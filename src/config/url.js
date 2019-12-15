import env from './env'

const DEV_URL = 'http://111.231.135.83/api'
const PRO_URL = 'http://111.231.135.83/api'

export default env === 'development' ? DEV_URL : PRO_URL