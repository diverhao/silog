import React, { Children, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
// import { Outlet, Link } from 'react-router-dom';
// import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { SearchBar } from './SearchBar';
import {
    BrowserRouter,
    Routes,
    Route,
    Link,
    Outlet,
    useNavigate,
    useLocation,
    Navigate,
} from 'react-router-dom';
import { nanoid } from 'nanoid';


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

    topicsStr = "";
    _threadsData: type_threads = {};
    _threadData: type_thread | undefined = undefined;
    _searchBar: SearchBar;

    constructor() {
        this._searchBar = new SearchBar(this);
    }


    _Element = () => {

        return (

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<this.Layout />}>
                        {/* <Route index element={<div> Home</div>} />  */}
                        {/* <Route index element={<Navigate to="/search?timeRange=0+3751917376000"></Navigate>} />  */}
                        <Route index element={<this._ElementThreadsWrapper></this._ElementThreadsWrapper>}></Route>
                        <Route path="search" element={<this._ElementThreadsWrapper></this._ElementThreadsWrapper>}></Route>
                        <Route path="thread" element={<this._ElementThread></this._ElementThread>}></Route>
                    </Route>
                </Routes>
            </BrowserRouter>
        );
    }
    
    Layout = () => {
        const navigate = useNavigate();
        React.useEffect(() => {

            const searchQuery: Record<string, any> = {};
            searchQuery["timeRange"] = [0, 3751917376000];


            if (window.location.pathname === "/thread") {
                // "/thread" route
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
                        this.setThreadData(data.result);
                        const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                        navigate(url, { state: nanoid() });
                    })
            } else {
                // "/search" or "/"
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

                        this.setThreadsData(data.result);

                        const searchQueryStr: Record<string, any> = {
                            timeRange: searchQuery["timeRange"].join(" ").trim(),
                        }
                        if (searchQuery["authors"] !== undefined && searchQuery["authors"].length > 0) {
                            searchQueryStr["authors"] = searchQuery["authors"].join(" ").trim();
                        }
                        if (searchQuery["keywords"] !== undefined && searchQuery["keywords"].length > 0) {
                            searchQueryStr["keywords"] = searchQuery["keywords"].join(" ").trim();
                        }
                        if (window.location.pathname === "/search") {
                            const url = `/search?${new URLSearchParams(searchQueryStr)}`;
                            navigate(url, { state: nanoid() })
                        } else {
                            navigate("/", { state: nanoid() })
                        }
                    })
            }
        }, [])

        return (
            <div>
                <this._ElementTopBar></this._ElementTopBar>
                <Outlet />
            </div>
        );
    }

    _ElementTopBar = () => {
        const navigate = useNavigate();

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

                            const searchQuery: Record<string, any> = {};
                            // searchQuery["timeRange"] = [0, 3751917376000];
                            searchQuery["timeRange"] = this.getSearchBar().timeRange;

                            if (this.getSearchBar().keywords.length > 0) {
                                searchQuery["keywords"] = this.getSearchBar().keywords;
                            }


                            if (this.getSearchBar().authors.length > 0) {
                                searchQuery["authors"] = this.getSearchBar().authors;
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

                                    this.setThreadsData(data.result);

                                    const searchQueryStr: Record<string, any> = {
                                        timeRange: searchQuery["timeRange"].join(" ").trim(),
                                    }
                                    if (searchQuery["authors"] !== undefined && searchQuery["authors"].length > 0) {
                                        searchQueryStr["authors"] = searchQuery["authors"].join(" ").trim();
                                    }
                                    if (searchQuery["keywords"] !== undefined && searchQuery["keywords"].length > 0) {
                                        searchQueryStr["keywords"] = searchQuery["keywords"].join(" ").trim();
                                    }
                                    navigate("/", { state: nanoid() })
                                })
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

    _ElementThreadThumbnail = ({ threadId, threadData }: { threadId: string, threadData: type_thread }) => {

        const mainPostData = threadData[0];
        const title = mainPostData["title"];
        const author = mainPostData["author"];
        const time = mainPostData["time"];
        const text = mainPostData["text"];
        const topics = mainPostData["topics"];
        const navigate = useNavigate();

        return (
            <tr>
                <td onClick={async (event: any) => {
                    this.setThreadData(threadData);
                    const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                    navigate(url, { state: nanoid() })
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

    _ElementThreadWrapper = () => {
        const location = useLocation();
        return <this._ElementThread key={location.search}></this._ElementThread>
    }

    _ElementThreadsWrapper = () => {
        const location = useLocation();
        return <this._ElementThreads key={location.search}></this._ElementThreads>
    }

    _ElementThreads = () => {
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
                        {Object.entries(this.getThreadsData()).map(([threadId, threadData]) => {
                            return (
                                <this._ElementThreadThumbnail threadId={threadId} threadData={threadData} key={threadId}></this._ElementThreadThumbnail>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    _ElementThread = () => {
        const location = useLocation();

        const threadData = this.getThreadData();
        console.log(threadData)
        if (threadData === undefined) {
            return <div>thread empty</div>;
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

    setThreadData = (newData: type_thread) => {
        this._threadData = newData;
    }

    getThreadData = () => {
        return this._threadData;
    }
}


const app = new App();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(app.getElement());
