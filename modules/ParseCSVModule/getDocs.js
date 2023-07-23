const parse = require('./parseAsyncCSVFiles')
const update = require('./updateDocs')


const getDocs = async (files) => {
    return await parse(files)
                .then(docs => {
                    const filtered = docs.map(doc => ({
                        ...doc,
                        fuzzyRefs: doc.fuzzyRefs.filter(res => res.isFound).map(ref => ref.docLink)
                    }))

                    let map = new Map()
                    for (let i = 0; i < filtered.length; i++) {
                        map.set(filtered[i].id, {
                            title: filtered[i].title,
                            year: filtered[i].year,
                            keywords: filtered[i].keywords,
                            refs: filtered[i].fuzzyRefs.map(ref => ({
                                refId: ref.id,
                                year: ref.year,
                                title: filtered[i].title,
                                keywords: ref.keywords
                            }))
                        })
                    }
                    return [...map]
                })

                .catch((err) => {
                    console.error(err)
                })
}

module.exports = getDocs





