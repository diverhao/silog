import React, { Children, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
// import { Outlet, Link } from 'react-router-dom';
// import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { SearchBar } from './SearchBar';


export type type_search_query = {
    timeRange: [number, number], // time range
    authors: string[], // match author, if [], match any author
    keywords: string[], // match title and text, if [], match any text
    topics: string[], // match topics, e.g. cryo, magnet, operation, if [], match any topic
    startingCount: number, // from which match should I return, e.g. 0, or 50
    count: number, // number of matches we want for this query, e.g. 50
}

/**
 * systems in the facility
 */
export type type_topic = "control" | "operation" | "cryo" | "magnet" | "physics";

/**
 * type of one post, a post could be 
 */
export type type_post = {
    title: string,
    author: string,
    time: number, // ms since epoch, time of post
    keywords: string[],
    // id: string, // uuid
    // subId: number, // 0 means it is the first post in a thread, 1 means the first follow-up post in a thread
    text: string,
    topics: type_topic[], // could be multiple system, vacuum, cryo, admin, control, magnet, ...
    attachments: string[], // any type file, e.g. pic, txt, others, located in the month folder
}

/**
 * Each thread is a collection of posts, there is one main post, rests are follow-ups
 */
export type type_thread = type_post[];

/**
 * Thread ID vs thread data
 */
export type type_threads = Record<string, type_thread>;

export class App {

    // keywordsStr = "";
    // authorsStr = "";
    topicsStr = "";
    _threadsData: type_threads = {};
    _threadData: type_thread | undefined = undefined;
    _searchBar: SearchBar;
    updateThreads = (input: any) => { };
    constructor() {
        this._searchBar = new SearchBar(this);

        window.addEventListener('popstate', (event) => {
            window.location.href = window.location.pathname + window.location.search;
        })
    }

    _Element = () => {
        return (
            <div style={{ marginTop: 0 }}>
                <this._ElementTopBar></this._ElementTopBar>
                <this._ElementThreads></this._ElementThreads>
            </div>
        );
    }

    // router independent
    // search bar
    _ElementTopBar = () => {
        React.useEffect(() => {
            const searchQuery: Record<string, any> = {};
            searchQuery["timeRange"] = [0, 3751917376000];


            if (window.location.pathname === "/thread") {
                const params = new URLSearchParams(window.location.search);

                const threadId = params.get('id');
                if (threadId === null) {
                    return;
                }

                fetch("/thread", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ threadId: threadId }),
                })
                    .then(
                        (res) => {
                            return res.json()
                        }
                    ).then(data => {
                        this.threadsArea = "thread";
                        this._threadData = data.result;

                        this.updateThreads({});

                        // manually change URL
                        const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                        window.history.pushState({}, '', url);
                    })
            } else {
                if (window.location.pathname === "/search") {
                    const params = new URLSearchParams(window.location.search);

                    const timeRangeStr = params.get('timeRange');
                    const keywordsStr = params.get('keywords');
                    const authorsStr = params.get('authors');

                    if (timeRangeStr !== null) {
                        const timeRangeStrArray = timeRangeStr.trim().split(" ");
                        if (timeRangeStrArray.length === 2) {
                            const tStart = parseInt(timeRangeStrArray[0]);
                            const tEnd = parseInt(timeRangeStrArray[1]);
                            if (!isNaN(tStart) && !isNaN(tEnd)) {
                                searchQuery["timeRange"] = [Math.min(tStart, tEnd), Math.max(tStart, tEnd)];
                            }
                        }
                    }

                    if (keywordsStr !== null) {
                        searchQuery["keywords"] = keywordsStr.trim().split(" ");
                    }

                    if (authorsStr !== null) {
                        searchQuery["authors"] = authorsStr.trim().split(" ");
                    }
                }

                fetch("/search", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(searchQuery),
                })
                    .then(
                        (res) => {
                            return res.json()
                        }
                    ).then(data => {
                        this.threadsArea = "threads";
                        const fullSearchQuery = data.query;
                        console.log(fullSearchQuery)
                        this.getSearchBar().keywords = fullSearchQuery["keywords"];
                        this.getSearchBar().timeRange = fullSearchQuery["timeRange"];
                        this.getSearchBar().authors = fullSearchQuery["authors"];
                        this.getSearchBar().forceUpdate({});

                        this.setThreadsData(data.result);
                        this.updateThreads({});
                    })
            }
        }, [])

        return (
            <div style={{
                marginTop: 0,
            }}>
                <div style={{
                    width: "90%",
                    height: 100,
                    paddingLeft: 50,
                    display: "inline-flex",
                    alignItems: "center",
                    position: "fixed",
                    backgroundColor: "white",
                    paddingBottom: 50,
                }}>
                    <img src="/logo.png" style={{
                        width: 200,
                        cursor: "pointer",
                    }}
                        onMouseDown={() => {
                            window.location.href = "/";
                        }}
                    ></img>
                    {this.getSearchBar().getElement()}
                </div>
                <div style={{
                    width: "90%",
                    height: 100,
                    paddingLeft: 50,
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "white",
                    paddingBottom: 50,
                }}>
                </div>
            </div>
        )
    }

    _ElementContent = ({ Children }: any) => {
        return (
            <div>
                {Children}
            </div>
        )
    }

    threadsArea: "threads" | "thread" = "threads";

    _ElementThreads = () => {
        const [, forceUpdate] = React.useState({});
        this.updateThreads = forceUpdate;

        if (this.threadsArea === "threads") {
            return (
                <div style={{
                    paddingLeft: 50,
                    paddingRight: 50,
                    fontFamily: "sans-serif",
                    width: "90%",
                }}>
                    <table style={{
                    }}>
                        <tbody>
                            {Object.entries(this.getThreadsData()).map(([threadId, thread]) => {
                                return (
                                    <this._ElementThreadAbstract threadId={threadId} key={threadId}></this._ElementThreadAbstract>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )
        } else {
            return (
                <this._ElementThread></this._ElementThread>
            )
        }
    }

    _ElementThreadAbstract = ({ threadId }: { threadId: string }) => {
        const threadData = this.getThreadsData()[threadId];
        const mainPostData = threadData[0];
        const title = mainPostData["title"];
        const author = mainPostData["author"];
        const time = mainPostData["time"];
        const text = mainPostData["text"];
        const topics = mainPostData["topics"];

        return (
            <tr>
                <td onClick={async (event: any) => {
                    const response = await fetch("/thread", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ threadId: threadId }),
                    });
                    const data = await response.json();
                    console.log(data.result)
                    this.threadsArea = "thread";
                    this._threadData = data.result;

                    this.updateThreads({});

                    // manually change URL
                    const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                    window.history.pushState({}, '', url);

                }}>
                    {title}
                </td>
                <td>
                    {author}
                </td>
                <td>
                    {new Date(time).toISOString()}
                </td>
            </tr>
        )
    }

    _ElementThread = () => {
        const threadData = this._threadData;
        console.log(threadData)
        if (threadData === undefined) {
            return null;
        }
        const mainPostData = threadData[0];
        const title = mainPostData["title"];
        const author = mainPostData["author"];
        const time = mainPostData["time"];
        const text = mainPostData["text"];
        const topics = mainPostData["topics"];

        return (
            <div>
                {title}
                {author}
                {time}
                {text}
                {topics}
            </div>
        )
    }

    _ElementPostAbstract = ({ postData, index }: { postData: type_post, index: number }) => {
        // index = 0, main post
        //         title: string,
        // author: string,
        // time: number, // ms since epoch, time of post
        // keywords: string[],
        // // id: string, // uuid
        // // subId: number, // 0 means it is the first post in a thread, 1 means the first follow-up post in a thread
        // text: string,
        // topics: type_topic[], // could be multiple system, vacuum, cryo, admin, control, magnet, ...
        // attachments: string[], // any type file, e.g. pic, txt, others, located in the month folder
        const title = postData["title"];
        const author = postData["author"];
        const time = postData["time"];
        const text = postData["text"];
        const topics = postData["topics"];
        return (
            <tr>
                <td>
                    {title}
                </td>
                <td>
                    {author}
                </td>
                <td>
                    {new Date(time).toISOString()}
                </td>

            </tr>
        )
    }



    getElement = () => {
        return <this._Element></this._Element>
    }

    getSearchBar = () => {
        return this._searchBar;
    }

    getThreadsData = () => {
        return this._threadsData;
    }

    setThreadsData = (newData: type_threads) => {
        this._threadsData = newData;
    }
}

const app = new App();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(app.getElement());
