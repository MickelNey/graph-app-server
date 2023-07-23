const cluster = require('netclustering').cluster

const searchArray = (array) => {
    let count = 0
    for (let i = 0; i < array.length; i++) {
        const element = array[i]
        if (Array.isArray(element)) {
            count += searchArray(element)
        } else {
            count++
        }
    }
    return count
}

const makeFlat = (array) => {
    return array.reduce((a, c) => {
        let v = c instanceof Array ? makeFlat(c) : c;
        return a.concat(v)
    }, [])
}

const clustering = (nodes, links, minNum = 0) => cluster(JSON.parse(JSON.stringify(nodes)), links)
    .filter(cluster => searchArray(cluster) > minNum)
    .map(cluster => makeFlat(cluster))

const getClusterSet = (clusters) => new Set(makeFlat(clusters))

module.exports = { clustering, getClusterSet }
