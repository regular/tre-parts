const Index = require('ssb-review-level')
 
function makeIndex() {
  return Index(4, function map (kv) {
    const {key, value} = kv
    const content = value && value.content
    let part = content && content['part-of'] || []
    if (!Array.isArray(part)) part = [part]
    const type = content && content.type
    const revisionRoot = (content && content.revisionRoot) || key

    return part.map(x => [x, type, revisionRoot])
  })
}

// sbot plugin interface
exports.name = 'tre-parts'
exports.version = require('./package.json').version
exports.manifest = {
  byAggregationAndType: 'source',
  read: 'source'
}
exports.init = function (ssb, config) {
  const PartsIndex = ssb.revisions.use('PartsIndex', makeIndex()).PartsIndex
  const sv = PartsIndex.unwrapped
  sv.byAggregationAndType = function(aggKey, type, opts) {
    if (!aggKey) throw new Error('Required parameter missing: aggregation key')
    const o = Object.assign({
      gt: [aggKey, type || null, null],
      lt: [aggKey, type || undefined, undefined]
    }, opts || {})
    return sv.read(o)
  }
  return sv
}
