const regs = {
    regDOI: /(10[.]\d{4,9}\/[-._;()/:A-Z0-9]+)/i,
    regYear: /(19[5-9]\d|200\d|201\d|202[0-3])/i,
}

const getAuthors = (item) => {
    if (String.fromCharCode(65279)+ 'Authors' in item) return item[String.fromCharCode(65279)+ 'Authors']
    if ('Authors' in item) return item['Authors']
}
  
const removePunctuationWithSort = (stroke) => stroke
    .split(' ')
    .map(word => word
      .replace(/[\s.,%]/g, '')
      .toLowerCase()
    )
    .sort()
    .join('')
  
const removePunctuation = (stroke) => stroke
    .split(' ')
    .map(word => word
        .replace(/[\s.,%]/g, '')
        .toLowerCase()
    )
    .join('')

const transformRef = (ref) => {
    const refYear = ref.match(regs.regYear)
    const DOI = ref.match(regs.regDOI)
    const fuzzyInfo = removePunctuationWithSort(ref.slice(0, refYear.index - 1))
    const notSorted = removePunctuation(ref.slice(0, refYear.index - 1))

    return {
        original: ref,
        year: refYear ? refYear[0] : '',
        fuzzyInfo,
        notSorted,
        DOI: DOI ? DOI[0] : '',
        hasDOI: !!DOI,
        hasYear: !!refYear,
        docLink: null,
        isFound: false
        // original: ref,
        // year: refYear ? refYear[0] : '',
        // authorsAndTitle,
        // notSorted,
        // DOI: DOI ? DOI[0] : '',
        // hasDOI: !!DOI,
        // hasYear: !!refYear,
        // docLink: null,
        // isFound: false
    }
}

const transformDoc = (item) => ({
    id: null,
    authors: getAuthors(item),
    title: item.Title,
    year: item.Year,
    DOI: item.DOI,
    keywords: item['Author Keywords'].split('; '),
    authorsAndTitle: removePunctuationWithSort( getAuthors(item) + ' ' + item['Title']),
    fuzzy: {
        authors: removePunctuationWithSort(getAuthors(item)),
        authorsAndTitle: removePunctuationWithSort( getAuthors(item) + ' ' + item['Title']),
        notSorted: removePunctuation(getAuthors(item) + ' ' + item['Title'])
    },
    fuzzyRefs: item.References.split('; ')
        .filter((item) => regs.regYear.test(item))
        .map((ref) => transformRef(ref)),
})



module.exports = transformDoc