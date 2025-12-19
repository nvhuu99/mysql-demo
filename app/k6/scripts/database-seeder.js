import { fail, sleep } from "k6"

import { productUtil } from "./utils/products.js"
import { orderUtil } from "./utils/orders.js"
import { randomInt, randomStr, forEachBatches } from "./utils/common.js"
import { users } from "./constants/users.js"

const {
  DB_MAX_CATEGORIES,
  DB_MAX_PRODUCTS,
  DB_MAX_ORDERS,

  WOO_API_ENDPOINT,
  BATCH_SIZE,
  MAX_DURATION,
  VERBOSE,
} = __ENV

export function setup() {
  var configs = {
    seedId: `${Date.now()}_${randomInt(10, 99)}`,
    wooApiEndpoint: WOO_API_ENDPOINT,
    verbose: VERBOSE,
  }

  return { configs } 
}

export const options = {
  scenarios: {
    main: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
      maxDuration: MAX_DURATION,
    },
  },
};

export default function(setupData) {
  try {
    var configs = setupData.configs
    productUtil.init(configs)
    orderUtil.init(configs)
    seedDatabase(configs)
    console.log("Seed database successfully - Seed ID: " + configs["seedId"])
  } catch (e) {
    fail(e.stack)
  }
}


function seedDatabase(configs) {
  const countCats = productUtil.countCategories()
  if (DB_MAX_CATEGORIES > countCats) {
    seedCategories(configs["seedId"], DB_MAX_CATEGORIES - countCats)
  }
  
  const countProds = productUtil.countProducts()
  console.log(countProds)
  if (DB_MAX_PRODUCTS > countProds) {
    seedSimpleProducts(configs["seedId"], DB_MAX_PRODUCTS - countProds)
  }
  
  const countOrds = orderUtil.countOrders()
  console.log(countOrds)
  if (DB_MAX_ORDERS > countOrds) {
    seedOrders(DB_MAX_ORDERS - countOrds)
  }
}

function seedCategories(seedId, total) {
  const newCategory = () => { 
    return { "name": `[${seedId}] ` + randomStr(randomInt(3, 8)) } 
  }
  const submitCategories = (categories) => {
    productUtil.createCategories(categories)
    sleep(1)
  }
  forEachBatches(total, BATCH_SIZE, newCategory, submitCategories)
}

function seedSimpleProducts(seedId, total) {
  const categoryIds = productUtil.listCategories().map(c => c["id"])
  const newProduct = () => {
    return {
      "name": `[${seedId}] ` + randomStr(randomInt(5, 25)),
      "type": "simple",
      "regular_price": randomInt(5, 1000),
      "description": randomStr(randomInt(25, 255)),
      "short_description": randomStr(25),
      "categories": [{"id": categoryIds[randomInt(0, categoryIds.length - 1)]}] 
    }
  }
  const submitProducts = (products) => {
    productUtil.createProducts(products)
    sleep(1)
  }
  forEachBatches(total, BATCH_SIZE, newProduct, submitProducts)
}

function seedOrders(total) {
  const totalProducts = productUtil.countProducts()
  const newOrder = () => {
    const userInfo = users[randomInt(0, users.length - 1)]
    const size = randomInt(1, 10)
    const products = productUtil.searchProducts({ offset: randomInt(0, totalProducts - size), per_page: size })
    return {
      "payment_method": "cod",
      "set_paid": true,
      "billing": userInfo,
      "shipping": userInfo,
      "line_items": products.map(p => { return { "product_id": p["id"], "quantity": randomInt(1, 10) }})
    } 
  }
  const submitOrders = (orders) => {
    orderUtil.createOrders(orders)
    sleep(1)
  }
  forEachBatches(total, BATCH_SIZE, newOrder, submitOrders)
}