import { sleep } from "k6"

const lorem = ["Sed","ut","perspiciatis","unde","omnis","iste","natus","error","sit","voluptatem","accusantium","doloremque","laudantium,","totam","rem","aperiam,","eaque","ipsa","quae","ab","illo","inventore","veritatis","et","quasi","architecto","beatae","vitae","dicta","sunt","explicabo.","Nemo","enim","ipsam","voluptatem","quia","voluptas","sit","aspernatur","aut","odit","aut","fugit,","sed","quia","consequuntur","magni","dolores","eos","qui","ratione","voluptatem","sequi","nesciunt.","Neque","porro","quisquam","est,","qui","dolorem","ipsum","quia","dolor","sit","amet,","consectetur,","adipisci","velit,","sed","quia","non","numquam","eius","modi","tempora","incidunt","ut","labore","et","dolore","magnam","aliquam","quaerat","voluptatem.","Ut","enim","ad","minima","veniam,","quis","nostrum","exercitationem","ullam","corporis","suscipit","laboriosam,","nisi","ut","aliquid","ex","ea","commodi","consequatur?","Quis","autem","vel","eum","iure","reprehenderit","qui","in","ea","voluptate","velit","esse","quam","nihil","molestiae","consequatur,","vel","illum","qui","dolorem","eum","fugiat","quo","voluptas","nulla","pariatur"]

export const HTTP_HEADERS = { "Content-Type": "application/json" }

export const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
export const randomStr = (len) => { var str = ""; while(len--) { str += " " + lorem[randomInt(0, lorem.length - 1)] }; return str.trimStart(); }
export const parseJsonReponse = (r, d = {}) => { try { return r.json() } catch(e) { return d } }
export const sleepWhen = (booleanValue, seconds) => sleep(booleanValue ? seconds : 0)
export const forEachBatches = (total, batchSize, batchItemBuilder, batchSubmitter) => {
    var batchNumber = Math.ceil(total / batchSize)
    while (batchNumber--) {
        var batchItems = []
        var count = (total - batchSize >= 0) ? batchSize : total
        var itemNumber = count
        while (itemNumber--) {
            batchItems.push(batchItemBuilder(batchNumber, itemNumber))
        }
        batchSubmitter(batchItems)
        total -= count
    }
}
export const toQueryString = (params) => {
    var keyValues = []
    for (var key in params) {
        if (params[key] != undefined && params[key] != null) {
            keyValues.push(`${key}=${encodeURIComponent(params[key])}`)
        }
    }
    return keyValues.join("&")
}