import env from './env'

const DEV_URL = '/api'
const PRO_URL = '/api'

export default env === 'development' ? DEV_URL : PRO_URL
