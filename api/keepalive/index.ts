import axios from 'axios'
import * as express from 'express'
import {app} from '../application'
import { getConfigValue } from '../configuration'
import { COOKIE_TOKEN } from '../configuration/references'

const cookieToken = getConfigValue(COOKIE_TOKEN)

async function handleAddressRoute(req, res) {
  try {
    const tokenSet = await app.locals.client.refresh(req.session.passport.user.tokenset.refresh_token)

    req.session.passport.user.tokenset = tokenSet

    axios.defaults.headers.common.Authorization = `Bearer ${tokenSet.access_token}`

    res.cookie(cookieToken, tokenSet.access_token)

    res.status(200).send({message: 'Keeping alive done'})

  } catch (e) {
    const errorMessage = JSON.stringify({message: 'Something went wrong with the heart beat'})
    res.status(500).send(errorMessage)
  }
}

export const router = express.Router({ mergeParams: true })
router.get('', handleAddressRoute)
