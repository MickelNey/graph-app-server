const { createCocitationNetworks, createLinksMap} = require('./getCoCitationNetworks')
const cluster = require('./createClusters')

const clustering = (docs, linksMap, minClusterValue, minLinksValue, minNodeValue) => {
    const [coCitationNetworks, nodes] = createCocitationNetworks(docs, linksMap, minLinksValue, minNodeValue)

    const clusters = cluster.clustering(nodes, coCitationNetworks, minClusterValue)
        .map(cluster => cluster.map(docArrayId => nodes[docArrayId].id))
    const clusterSet = cluster.getClusterSet(clusters)
    return [clusters, clusterSet]
}

const getClusteringGraph = (docs, minClusterValue = 20, minLinksValue = 2, minNodeValue = 10) => {
    const docsMap = new Map(docs)
    const linksMap = createLinksMap(docs)
    const [clusters, clusterSet] = clustering(docs, linksMap, minClusterValue, minLinksValue, minNodeValue)

    let nodes = []

    let yearMap = new Set()
    let nodesIdMap = new Map()

    for (let i = 0; i < clusters.length; i++) {
        const cluster = clusters[i]
        for (let j = 0; j < cluster.length; j++) {
            const s = cluster[j]
            nodes.push({
                id: s,
                value: 0,
                year: Number(docsMap.get(s).year),
                keywords: [...(docsMap.get(s).keywords)],
                title: docsMap.get(s).title,
                cluster: i + 1})
            nodesIdMap.set(s, nodes.length - 1)

            const year = nodes[nodes.length - 1].year
            if (!yearMap.has(year)) yearMap.add(year)
        }
    }

    let links = []

    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        if (linksMap.has(node.id)) {
            const nodeLinks = linksMap.get(node.id)
            for (let target of nodeLinks) {

                if (!clusterSet.has(target[0])) continue

                node.value += target[1]
                nodes[nodesIdMap.get(target[0])].value += target[1]

                links.push({ source: node.id, target: target[0], value: target[1]})

            }

        }
    }

    const clusterData = getTopKeywordsByCluster(nodes, clusters)

    return {
        links, 
        nodes, 
        clusterLength: clusters.length, 
        years: [...yearMap].sort((a, b) => a - b),
        clusterData
    }

}

const getTopKeywordsByCluster = (nodes, clusters) => {
    const map = new Map()
    const titleMap = new Map()

    for (let i = 0; i < nodes.length; i++) {
        const keywords = nodes[i].keywords
        const title = nodes[i].title
        const value = nodes[i].value
        const year = nodes[i].year
        const cluster = nodes[i].cluster
        if (!map.has(cluster)) {
            map.set(cluster, new Map())
            titleMap.set(cluster, [])
        }

        titleMap.get(cluster).push({title, value, year})

        for (let j = 0; j < keywords.length; j++) {
            const keyword = keywords[j].toLowerCase()
            if (!map.get(cluster).has(keyword)) map.get(cluster).set(keyword, 0)
            map.get(cluster).set(keyword, map.get(cluster).get(keyword) + 1)
        }
    }
    const data = []
    for(let cl of titleMap) {
        data.push({
            cluster: cl[0],
            titles: cl[1]
                .sort((a, b) => b.value - a.value)
                .filter((el, index) => index < 5),
            keywords: [...map.get(cl[0])]
                .sort((a, b) => b[1] - a[1])
                .filter((el, index) => index < 5),
            count: clusters[cl[0] - 1].length
        })
    }

    return data
}

module.exports = { getClusteringGraph, getTopKeywordsByCluster }