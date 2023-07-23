const cluster = require('./createClusters')

const filterDocs = (docs) => {
    return docs.filter(doc => doc[1].refs.length !== 0)
            .map(doc => doc[1])
}
    
const createLinksMap = (docs) => {
    const fDocs = filterDocs(docs)
    let linksMap = new Map()
    for (let i = 0; i < fDocs.length; i++) {
        const refs = fDocs[i].refs

        for (let j = 0; j < refs.length; j++) {
            for (let k = j + 1; k < refs.length; k++) {

                const first = refs[j].refId
                const second = refs[k].refId

                const [linkSource, linkTarget] = first > second ? [first, second] : [second, first]

                if (!linksMap.has(linkSource))
                    linksMap.set(linkSource, new Map())

                if (!linksMap.get(linkSource).has(linkTarget))
                    linksMap.get(linkSource).set(linkTarget, 0)

                linksMap.get(linkSource).set(linkTarget, linksMap.get(linkSource).get(linkTarget) + 1)
            }
        }
    }
    return linksMap
}

const createCocitationNetworks = (docs, linksMap, minValue = 0, minNodeValue = 0) => {
        const docsMap = new Map(docs)
        let nodesMap = new Map()
        let nodes = []

        for (let source of linksMap.keys()) {
            for (let target of linksMap.get(source))
            {
                const s = source
                const t = target[0]
                const v = Number(target[1])
                if (v < minValue) continue

                if (!nodesMap.has(s))  {
                    nodes.push({ 
                        id: s, 
                        value: 0, 
                        year: Number(docsMap.get(s).year), 
                        keywords: [...(docsMap.get(s).keywords)]
                    })
                    nodesMap.set(s, nodes.length - 1)
                }

                if (!nodesMap.has(t))  {
                    nodes.push({ 
                        id: t, 
                        value: 0, 
                        year: Number(docsMap.get(t).year), 
                        keywords: [...(docsMap.get(t).keywords)]
                    })
                    nodesMap.set(t, nodes.length - 1)
                }

                nodes[nodesMap.get(s)].value += v
                nodes[nodesMap.get(t)].value += v
            }
        }

        const filtered = nodes.filter(node => node.value > minNodeValue)
        const filteredMap = new Map()
        for (let i = 0; i < filtered.length; i++) {
            filteredMap.set(filtered[i].id, i)
        }
        const filteredNodesSet = new Set(filtered.map(node => node.id))

        let links = []
        for (let source of linksMap.keys()) {
            if (!filteredNodesSet.has(source)) continue
            for (let target of linksMap.get(source))
            {
                const s = source
                const t = target[0]
                const v = Number(target[1])
                if (!filteredNodesSet.has(t)) continue

                links.push({ source: filteredMap.get(s), target: filteredMap.get(t), value: v})
            }
        }
        
        return [links, filtered]
}

const createBiblCouplingNetworks = (docs, linksMap, minValue = 0, minNodeValue = 0) => {
    const docsMap = new Map(docs)
    let nodesMap = new Map()

    let links = []
    let nodes = []

    for (let source of linksMap.keys()) {
        for (let target of linksMap.get(source))
        {
            const s = source
            const t = target[0]
            const v = Number(target[1])
            if (v < minValue) continue

            if (!nodesMap.has(s))  {
                nodes.push({ id: s, value: 0, year: Number(docsMap.get(s).year), keywords: [...(docsMap.get(s).keywords)]})
                nodesMap.set(s, nodes.length - 1)
            }

            if (!nodesMap.has(t))  {
                nodes.push({ id: t, value: 0, year: Number(docsMap.get(t).year), keywords: [...(docsMap.get(t).keywords)]})
                nodesMap.set(t, nodes.length - 1)
            }

            nodes[nodesMap.get(s)].value += v
            nodes[nodesMap.get(t)].value += v
        }
    }

    const filtered = nodes.filter(node => node.value > minNodeValue)
    const filteredMap = new Map()
    for (let i = 0; i < filtered.length; i++) {
        filteredMap.set(filtered[i].id, i)
    }

    const filteredNodesSet = new Set(filtered.map(node => node.id))

    const testLinksSet = new Set()

    for (let source of linksMap.keys()) {
        if (!filteredNodesSet.has(source)) continue
        for (let target of linksMap.get(source))
        {
            const s = source
            const t = target[0]
            const v = Number(target[1])
            if (!filteredNodesSet.has(t)) continue
            testLinksSet.add(s)
            testLinksSet.add(t)
            links.push({ source: filteredMap.get(s), target: filteredMap.get(t), value: v})

        }
    }
    
    return [links, filtered]
}


module.exports = { createLinksMap, createCocitationNetworks, createBiblCouplingNetworks}


