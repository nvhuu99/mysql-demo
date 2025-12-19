import { fail, sleep } from "k6"
import { Counter } from 'k6/metrics';

import { productUtil } from "./utils/products.js"
import { orderUtil } from "./utils/orders.js"
import { randomInt, randomStr } from "./utils/common.js"
import { users } from "./constants/users.js"

const {
  SIMULATE_READ_WRITE_RATIO,
  RAMPING_STAGES_JSON,
  MAX_ERRORS,
  WOO_API_ENDPOINT,
  VERBOSE,
} = __ENV


const errorsCounter = new Counter('errsCounter');
const readsCounter = new Counter('readsCounter');
const writesCounter = new Counter('writesCounter');

export const options = {
  scenarios: {
    main: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: JSON.parse(RAMPING_STAGES_JSON),
    }
  },
  thresholds: {
    'errsCounter': [
      {
        threshold: 'count<=' + MAX_ERRORS,
        abortOnFail: true,
        delayAbortEval: '0s',
      }
    ],
  },
};

export function setup() {

  if (SIMULATE_READ_WRITE_RATIO >= 1) {
    fail("SIMULATE_READ_WRITE_RATIO variable must be less than 1.0")
  }

  var configs = {
    wooApiEndpoint: WOO_API_ENDPOINT,
    verbose: VERBOSE,
  }
  productUtil.init(configs)
  orderUtil.init(configs)

  console.log("setup completed")

  return { configs } 
}

export default function(setupData) {
  try {
    var configs = setupData.configs
    productUtil.init(configs)
    orderUtil.init(configs)
    simulate()
  }
  catch(e) {
    console.error(e.stack);
    errorsCounter.add(1)
  }
  sleep(1)
}

export function handleSummary(data) {
  var readsCount = data['metrics']['readsCounter'] ? data['metrics']['readsCounter']['values']['count'] : 0
  var writesCount = data['metrics']['writesCounter'] ? data['metrics']['writesCounter']['values']['count'] : 0
  var output = `
    ⭐Summary:
      Read totals:   ${readsCount}
      Write totals:  ${writesCount}
  `
  return { stdout: output }
}


const choices = (SIMULATE_READ_WRITE_RATIO <= 0.5) ? ['read', 'write'] : ['write', 'read']
const readRatio = SIMULATE_READ_WRITE_RATIO * 100
const writeRatio = 100 - readRatio
const ratios = [readRatio, writeRatio].sort()
const simulate = () => {
  var r = randomInt(1, 100)
  var sum = 0
  var choice = null
  for (var i = 0; i < 2; ++i) {
    sum += ratios[i]
    if (r <= sum) {
      choice = choices[i]
      break
    }
  }
  if (choice == 'read') {
    readProducts()
    readsCounter.add(1)
  } else {
    createOrder()
    writesCounter.add(1)
  }
}

function readProducts() {
  const categories = productUtil.listCategories({ offset: randomInt(0, 20), per_page: 100 })
  const countProducts = productUtil.countProducts(true)
  const size = Math.min(25, countProducts)
  productUtil.searchProducts({
    "search": randomStr(1),
    "category": (categories.length > 0) ? categories[0]['id'] : null,
    "min_price": 0,
    "max_price": 1000000000,
    "offset": randomInt(0, countProducts - size),
    "per_page": size
  })
}

function createOrder() {
  const size = randomInt(1, 10)
  const countProducts = productUtil.countProducts()
  const products = productUtil.searchProducts({ offset: randomInt(0, countProducts - size), per_page: size })
  const userInfo = users[randomInt(0, users.length - 1)]
  const order = {
    "payment_method": "cod",
    "set_paid": true,
    "billing": userInfo,
    "shipping": userInfo,
    "line_items": products.map(p => { return { "product_id": p["id"], "quantity": randomInt(1, 10) }})
  }
  orderUtil.createOrders([order])
}
