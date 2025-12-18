import { productUtil } from "./utils/products.js"

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
    testId: `${Date.now()}_${Math.floor(Math.random() * 100000)}`,
    wooApiEndpoint: WOO_API_ENDPOINT,
    batchSize: BATCH_SIZE,
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
  productUtil.seedCategories(SEED_CATEGORIES_TOTAL)
  productUtil.seedProducts(SEED_PRODUCTS_TOTAL)
  productUtil.seedOrders(SEED_ORDERS_TOTAL)

  console.log("Test ID: " + configs["testId"])
}
