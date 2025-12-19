import { sleep } from "k6"

import { productUtil } from "./utils/products.js"
import { orderUtil } from "./utils/orders.js"
import { randomInt, randomStr, forEachBatches } from "./utils/common.js"
import { users } from "./constants/users.js"

const {
  SEED_CATEGORIES_TOTAL,
  SEED_PRODUCTS_TOTAL,
  SEED_ORDERS_TOTAL,

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
  var configs = setupData.configs

  productUtil.init(configs)
  orderUtil.init(configs)

  seedCategories(configs["seedId"], SEED_CATEGORIES_TOTAL)
  seedSimpleProducts(configs["seedId"], SEED_PRODUCTS_TOTAL)
  seedOrders(configs["seedId"], SEED_ORDERS_TOTAL)

  console.log("Seed ID: " + configs["seedId"])
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
  const categoryIds = productUtil.listCategories({ search: seedId, per_page: 20 }).map(c => c["id"])
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

function seedOrders(seedId, total) {
  const totalProducts = productUtil.countSimpleProducts()
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