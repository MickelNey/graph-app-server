interface strokeForSearch {
    originalInfo: string
    unPunctuationInfo: string
    unPunctuationSortedInfo: string
}

interface docType {
    id: number | null
    authors: string
    title: string
    year: string
    DOI: string
    keywords: string[]
    strokesForSearch: strokeForSearch
    refs: refType[]
}

interface refType {
    strokesForSearch: strokeForSearch
    year: string
    DOI: string
    hasDOI: boolean
    hasYear: boolean
    docLink: object | null
    isFound: boolean
} 
