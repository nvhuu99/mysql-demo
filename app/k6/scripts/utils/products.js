import { fail } from 'k6'
import http from "k6/http"

import { parseJsonReponse, toQueryString, HTTP_HEADERS } from './common.js'


export const productUtil = {

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

  listCategories(filters) {
    const endpoint = `${this.wooApiEndpoint}/products/categories?${toQueryString(filters)}`
    var response = http.get(endpoint, { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.failWhen(response.status != 200, null, "failed to list categories: " + JSON.stringify(body))
    return body
  },

  countSimpleProducts() {
    const endpoint = `${this.wooApiEndpoint}/reports/products/totals`
    var response = http.get(endpoint, { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.failWhen(response.status != 200, null, "failed to count products: " + JSON.stringify(body))
    return body.filter(r => r["slug"] == "simple").at(0)["total"]
  },

  searchProducts(filters) {
    const endpoint = `${this.wooApiEndpoint}/products?${toQueryString(filters)}`
    var response = http.get(endpoint, { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.failWhen(response.status != 200, null, "failed to search products: " + JSON.stringify(body))
    return body
  },

  createCategories(categories) {
    const endpoint = `${this.wooApiEndpoint}/products/categories/batch`
    var response = http.post(endpoint, JSON.stringify({ "create": categories }), { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.failWhen(response.status != 200, `created ${categories.length} categories`, "failed to create categories: " + JSON.stringify(body))
    return body["create"]
  },

  createProducts(products) {
    const endpoint = `${this.wooApiEndpoint}/products/batch`
    var response = http.post(endpoint, JSON.stringify({ "create": products }), { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.failWhen(response.status != 200, `created ${products.length} products`, "failed to create products: " + JSON.stringify(body))
    return body["create"]
  },
}
