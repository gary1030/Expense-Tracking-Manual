export function timeStampToDate(timeStamp: number) {
    const date = new Date(timeStamp)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const dateString = `${year}/${month}/${day}`
    return dateString
}

export function getYear(timeStamp: number) {
    const date = new Date(timeStamp)
    const year = date.getFullYear()
    return year
}

export function getMonth(timeStamp: number) {
    const date = new Date(timeStamp)
    const month = date.getMonth() + 1
    return month
}

export function getDate(timeStamp: number) {
    const date = new Date(timeStamp)
    const day = date.getDate()
    return day
}