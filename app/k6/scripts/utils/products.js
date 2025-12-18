import { fail, sleep } from 'k6'
import http from "k6/http"

import { forEachBatches, parseJsonReponse, randomInt, randomStr } from './common.js'
import { users } from '../constants/users.js'

const HTTP_HEADERS = { "Content-Type": "application/json" }

export const productUtil = {

  /* Required arguments */
  testId: "",
  wooApiEndpoint: "",

  /* Optional arguments */
  batchSize: 10,
  verbose: true,

  /* Props */
  categories: [],
  productsTotal: 0,


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

  getRandomSeededCategory() {
    var index = randomInt(0, this.categories.length - 1)
    return this.categories[index]
  },

  getRandomSeededProducts(total) {
    const offset = randomInt(0, this.productsTotal - total)
    const endpoint = `${this.wooApiEndpoint}/products?search=${this.testId}&offset=${offset}&per_page=${total}`
    var response = http.get(endpoint, { headers: HTTP_HEADERS })
    var body = parseJsonReponse(response)
    this.failWhen(response.status != 200, null, "failed to get products: " + JSON.stringify(body))
    return body
  },

  seedCategories(total) {
    const endpoint = `${this.wooApiEndpoint}/products/categories/batch`
    const newCategory = (b, i) => { 
      return { "name": `test_${this.testId}_category_${b}_${i}` } 
    }
    const submitCategories = (categories) => {
      var response = http.post(endpoint, JSON.stringify({ "create": categories }), { headers: HTTP_HEADERS })
      this.failWhen(response.status != 200, 
        `created ${categories.length} categories`, 
        "failed to create categories: " + JSON.stringify(parseJsonReponse(response))
      )
      this.categories.push(...parseJsonReponse(response)["create"])
      sleep(1)
    }
    forEachBatches(total, this.batchSize, newCategory, submitCategories)
  },

  seedProducts(total) {
    const endpoint = `${this.wooApiEndpoint}/products/batch`
    const newProduct = (b, i) => {
      return { 
        "name": `test_${this.testId}_category_${b}_${i}`,
        "type": "simple",
        "regular_price": randomInt(5, 1000),
        "description": randomStr(25, 255),
        "short_description": randomStr(25),
        "categories": [{"id": this.getRandomSeededCategory()["id"]}] 
      } 
    }
    const submitProducts = (products) => {
      var response = http.post(endpoint, JSON.stringify({ "create": products }), { headers: HTTP_HEADERS })
      this.failWhen(response.status != 200,
        `created ${products.length} products`,
        "failed to create products: " + JSON.stringify(parseJsonReponse(response))
      )
      this.productsTotal += products.length
      sleep(1)
    }
    forEachBatches(total, this.batchSize, newProduct, submitProducts)
  },

  seedOrders(total) {
    const endpoint = `${this.wooApiEndpoint}/orders/batch`
    const newOrder = (b, i) => {
      var userInfo = users[randomInt(0, users.length - 1)]
      var products = this.getRandomSeededProducts(randomInt(1, Math.min(this.productsTotal, 15)))
      return {
        "payment_method": "cod",
        "set_paid": true,
        "billing": userInfo,
        "shipping": userInfo,
        "line_items": products.map(p => { return { "product_id": p["id"], "quantity": randomInt(1, 10) }})
      } 
    }
    const submitOrders = (orders) => {
      var response = http.post(endpoint, JSON.stringify({ "create": orders }), { headers: HTTP_HEADERS })
      this.failWhen(response.status != 200,
        `created ${orders.length} orders`,
        "failed to create orders: " + JSON.stringify(parseJsonReponse(response))
      )
      sleep(1)
    }
    forEachBatches(total, this.batchSize, newOrder, submitOrders)
  }
}
