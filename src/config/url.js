import env from './env'

const DEV_URL = 'http://10.211.55.2:8082/mf-edu'
const PRO_URL = 'http://localhost:8082/mf-edu'

export default env === 'development' ? DEV_URL : PRO_URL
