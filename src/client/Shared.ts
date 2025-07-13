import { type_search_query } from "./App";

/**
 * From type_search_query object to an string for URL
 */
export const convertSearchQueryToUrl = (searchQuery: type_search_query) => {
    const searchQueryStr: Record<string, any> = {
        timeRange: searchQuery["timeRange"].join(" ").trim(),
    }
    if (searchQuery["author"] !== undefined && searchQuery["author"].length > 0) {
        searchQueryStr["author"] = searchQuery["author"];
    }
    if (searchQuery["topic"] !== undefined && searchQuery["topic"].length > 0) {
        searchQueryStr["topic"] = searchQuery["topic"];
    }
    if (searchQuery["keywords"] !== undefined && searchQuery["keywords"].length > 0) {
        searchQueryStr["keywords"] = searchQuery["keywords"].join(" "); // use space to separate, shown as "+" in address bar
    }
    if (searchQuery["startingCount"] !== undefined && searchQuery["startingCount"] !== 0) {
        searchQueryStr["startingCount"] = `${searchQuery["startingCount"]}`; // use space to separate, shown as "+" in address bar
    }
    return `/search?${new URLSearchParams(searchQueryStr)}`;

}

export const getTimeStr = (msSinceEpoch: number) => {
    const date = new Date(msSinceEpoch);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const doSearch = async (searchQuery: type_search_query) => {
    try {
        const response = await fetch("/search", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchQuery),
        });
        const data = await response.json();
        return data;
    } catch (e) {
        console.log(e);
        return undefined;
    }
}


// convert ms-since-epoch to date in format of 2025-12-23
export const convertTime = (msSinceEpoch: number) => {
    const date = new Date(msSinceEpoch);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export const farFuture = 3751917376000;