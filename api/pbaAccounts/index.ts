import { AxiosPromise } from 'axios'
import * as express from 'express'
import { environmentConfig } from '../lib/environment.config'
import { http } from '../lib/http'

async function handleAddressRoute(req, res) {
  let errReport: any
  if (!req.query.accountNames) {
    errReport = {
      apiError: 'Account is missing',
      apiStatusCode: '400',
      message: 'Fee And Pay route error',
    }
    res.status(500).send(errReport)
  }
  const accountNames = req.query.accountNames.split(',')
  const accounts = []
  const accountPromises = new Array<AxiosPromise<any>>()
  accountNames.forEach((accountName: string) => accountPromises.push(getAccount(accountName)))

  try {
    console.log(accounts)
    await Promise.all(accountPromises).catch(err => err).then(allAccounts => {
      allAccounts.forEach(account => {
        const data = account.data === 'Account not found' ? {account_name: 'account not found'} : account.data
        accounts.push(data)
      })
    })
  } catch (error) {
    console.error(error)
    errReport = {
      apiError: error && error.data && error.data.message ? error.data.message : error,
      apiStatusCode: error && error.status ? error.status : '',
      message: `Fee And Pay route error `,
    }
    res.status(error && error.status ? error.status : 500).send(errReport)
    return
  }
  res.send(accounts)
}

function getAccount(accountName: string): AxiosPromise<any> {
  const url = `${environmentConfig.services.feeAndPayApi}/accounts/${accountName}`
  const promise = http.get(url).catch(err => err);
  return promise
}

export const router = express.Router({ mergeParams: true })

router.get('', handleAddressRoute)

export default router
