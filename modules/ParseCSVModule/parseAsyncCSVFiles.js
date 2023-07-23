const csv = require('csv-parser')
const stream = require('stream')
const transformDoc = require('./transformDocs')
const {updateRefsWithAuthorsAndTitle, updateRefsWithDoi} = require('./updateDocs')

function readFile(file) {
    return new Promise((resolve, reject) => {
        const results = []
        const readable = stream.Readable.from(file);
        readable
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err))
    })
}

const convertCSVfiles = async (files) => {
    console.log('fff')
    console.log(files[0])
    const promises = files.map((file) => {
        return readFile(file.data).then((data) => {
            return data
                .map((item) => {
                    return transformDoc(item)
                })
                .filter((item) => item.fuzzyRefs.length > 0 && item.keywords.length > 0)
        })
    })

    return await Promise.all(promises)
        .then((data) => {
            let array = []
            for (let i = 0; i < data.length; i++) {
                array = array.concat(data[i])
            }
            return array
        })
        .then(data => {
            
            for (let i = 0; i < data.length; i++) {
                data[i].id = i
            }
            data.forEach(doc => {
                console.log({
                    ...doc,
                    fuzzyRefs: null
                })
            })
            return updateRefsWithAuthorsAndTitle(updateRefsWithDoi(data))
        })
}  

module.exports = convertCSVfiles