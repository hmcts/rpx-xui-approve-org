export default {
  services: {
    ccdDataApi: 'http://localhost:4452',
    ccdDefApi: 'http://localhost:4452',
    idamWeb: 'https://localhost:3501',
    idamApi: 'http://localhost:4501',
    s2s: 'http://localhost:4502',
    draftStoreApi: 'http://localhost:8080',
    dmStoreApi: 'http://localhost:4603',
    emAnnoApi: 'http://localhost:3621',
    emNpaApi: 'http://localhost:3622'
  },
  health: {
    ccdDataApi: 'http://localhost:4452/health',
    ccdDefApi: 'http://localhost:4452/health',
    idamWeb: 'https://localhost:3501/health',
    idamApi: 'http://localhost:4501/health',
    s2s: 'http://localhost:4502/health',
    draftStoreApi: 'http://localhost:8080/health',
    dmStoreApi: 'http://localhost:4603/health',
    emAnnoApi: 'http://localhost:3621/health',
    emNpaApi: 'http://localhost:3622/health'
  },
  useProxy: false,
  protocol: 'http',
  secureCookie: false,
  sessionSecret: 'secretSauce'
};
