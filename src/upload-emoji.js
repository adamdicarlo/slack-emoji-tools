import { rejects } from 'assert'
import _ from 'lodash'
import superagent from 'superagent'
import SuperagentThrottle from 'superagent-throttle'
import uuid from 'uuid'
import getSlackApiData from './get-slack-api-data'

const { apiToken, versionUid } = getSlackApiData()
const version = versionUid ? versionUid.substring(0, 8) : 'noversion'
const NO_OP = function () {}

const superagentThrottle = new SuperagentThrottle({
  active: true,
  concurrent: 5,
  rate: Infinity
})

export function getAllEmoji () {
  const timestamp = Date.now() / 1000

  return new Promise((resolve, reject) => {
    superagent
      .get('/api/emoji.adminList')
      .withCredentials()
      .query({ token: apiToken, count: 10000 })
      .end((error, response) => {
        const uploadError = error || _.get(response.body, 'error')
        if (uploadError) {
          rejects(uploadError)
        } else {
          resolve(response.body.emoji)
        }
      })
  })
}

export default function uploadEmoji (file, callback = NO_OP) {
  const { apiToken, versionUid } = getSlackApiData()
  const timestamp = Date.now() / 1000
  const version = versionUid ? versionUid.substring(0, 8) : 'noversion'
  const id = uuid.v4()
  const name = file.name.split('.')[0]
  const imageUploadRequest = superagent
    .post('/api/emoji.add')
    .withCredentials()
    .query(`_x_id=${version}-${timestamp}`)
    .field('name', name)
    .field('mode', 'data')
    .field('token', apiToken)
    .attach('image', file)
    .use(superagentThrottle.plugin())
    .end((error, response) => {
      const uploadError = error || _.get(response.body, 'error')
      callback(uploadError, response)
    })

  return id
}
