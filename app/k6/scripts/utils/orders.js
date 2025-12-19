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

  errorIf(predicate, verboseMsg, failMsg) {
    if (predicate) {
      if (failMsg != null) {
        console.log(this.logTemplate(failMsg))
        throw new Error(failMsg)
      }
    } else {
      if (verboseMsg != null) {
        this.verboseLog(verboseMsg)
      }
    }
  },


  init(properties) {
    Object.assign(this, properties)
  },

  countOrders() {
    const endpoint = `${this.wooApiEndpoint}/reports/orders/totals`
    var response = http.get(endpoint, { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.errorIf(response.status != 200, null, "failed to count orders: " + JSON.stringify(body))
    return body.reduce((sum, report) => sum + report["total"], 0)
  },

  createOrders(orders) {
    const endpoint = `${this.wooApiEndpoint}/orders/batch`
    var response = http.post(endpoint, JSON.stringify({ "create": orders }), { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.errorIf(response.status != 200, `created ${orders.length} orders`, "failed to create orders: " + JSON.stringify(body))
    return body["create"]
  }
}
