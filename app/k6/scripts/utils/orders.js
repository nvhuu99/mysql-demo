import { fail } from 'k6'
import http from "k6/http"

import { parseJsonReponse, HTTP_HEADERS } from './common.js'


export const orderUtil = {

  /* Required arguments */
  wooApiEndpoint: "",

  /* Optional arguments */
  verbose: true,


  logTemplate(message) {
    return `vu: ${__VU} - ${message}`
  },

  verboseLog(message) {
    if (this.verbose == 'true') {
      console.log(this.logTemplate(message))
    } 
  },

  failWhen(predicate, passMsg, failMsg) {
    if (predicate) {
      if (failMsg != null) {
        fail(this.logTemplate(failMsg))
      }
    } else {
      if (passMsg != null) {
        this.verboseLog(passMsg)
      }
    }
  },


  init(properties) {
    Object.assign(this, properties)
  },

  createOrders(orders) {
    const endpoint = `${this.wooApiEndpoint}/orders/batch`
    var response = http.post(endpoint, JSON.stringify({ "create": orders }), { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.failWhen(response.status != 200, `created ${orders.length} orders`, "failed to create orders: " + JSON.stringify(body))
    return body["create"]
  }
}
