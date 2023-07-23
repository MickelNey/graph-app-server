const updateRefsWithDoi = (docs) => {
    const mapDOI = new Map()

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i]
        for (let j = 0; j < doc.fuzzyRefs.length; j++) {
            const ref = doc.fuzzyRefs[j]

            if (!ref.hasDOI || ref.isFound) continue

            if (!mapDOI.has(ref.DOI)) mapDOI.set(ref.DOI, [])
            mapDOI.get(ref.DOI).push(ref)
        }
    }

    let count = 0
    for (let i = 0; i < docs.length; i++) {
        const curDoc = docs[i]
        if (mapDOI.has(curDoc.DOI)) {
            const parents = mapDOI.get(curDoc.DOI)
            for (let j = 0; j < parents.length; j++) {
                parents[j].isFound = true
                parents[j].docLink = curDoc
                count++
            }
        }
    }

    return docs
}

const updateRefsWithAuthorsAndTitle = (docs) => {
    const mapTitle = new Map()

    for (let i = 0; i < docs.length; i++) {
        const doc = docs[i]
        for (let j = 0; j < doc.fuzzyRefs.length; j++) {
            const ref = doc.fuzzyRefs[j]

            if (ref.fuzzyInfo.length === 0 || ref.isFound) continue

            if (!mapTitle.has(ref.fuzzyInfo)) mapTitle.set(ref.fuzzyInfo, [])
            mapTitle.get(ref.fuzzyInfo).push(ref)
        }
    }
    let count = 0
    for (let i = 0; i < docs.length; i++) {
        const curDoc = docs[i]
        if (mapTitle.has(curDoc.fuzzy.authorsAndTitle)) {
            const parents = mapTitle.get(curDoc.fuzzy.authorsAndTitle)
            for (let j = 0; j < parents.length; j++) {
                parents[j].isFound = true
                parents[j].docLink = curDoc
                count++
            }
        }
    }
    return docs
}

module.exports = {updateRefsWithDoi, updateRefsWithAuthorsAndTitle}
