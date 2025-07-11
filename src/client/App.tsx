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
    useBlocker,
    createBrowserRouter,
    RouterProvider,
} from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Thread } from './Thread';
import { v4 as uuidv4 } from "uuid";


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
    _thread: Thread = new Thread();
    _searchBar: SearchBar;

    constructor() {
        this._searchBar = new SearchBar(this);
    }

    _Element = () => {


        const router = createBrowserRouter([
            {
                path: '/',
                element: <this.Layout />,
                children: [
                    {
                        index: true,
                        element: <this._ElementThreadsWrapper />,
                    },
                    {
                        path: 'search',
                        element: <this._ElementThreadsWrapper />,
                    },
                    {
                        path: 'thread',
                        element: <this._ElementThreadWrapper />,
                    },

                ],
            },
        ]);
        return (
            <RouterProvider router={router} />
        )
    }

    Layout = () => {
        const navigate = useNavigate();

        React.useEffect(() => {

            const searchQuery: Record<string, any> = {};
            searchQuery["timeRange"] = [0, 3751917376000];

            if (this.getThread().getState() === "adding-post" || this.getThread().getState() === "adding-thread") {
                const confirmed = window.confirm("Do you want to disgard the post?");
                if (confirmed === false) {
                    return;
                }
                this.getThread().setState("view");
            }


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
                        this.getThread().setThreadData(threadId, data.result);
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
            <div style={{
            }}>
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

                            if (this.getThread().getState() === "adding-post" || this.getThread().getState() === "adding-thread") {
                                const confirmed = window.confirm("Do you want to disgard the post?");
                                if (confirmed === false) {
                                    return;
                                }
                                this.getThread().setState("view");
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
                    <this._ElementAddThreadButton></this._ElementAddThreadButton>
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

    _ElementAddThreadButton = () => {
        const navigate = useNavigate();
        const elementRef = React.useRef<any>(null);
        return (
            <div
                ref={elementRef}
                onClick={async () => {
                    // this.setState("adding-post");
                    // in transition, waiting for approval
                    this.getThread().setState("adding-thread");
                    const threadId = uuidv4();
                    this.getThread().setThreadData(threadId, [
                        // {
                        //     title: "new title",
                        //     author: "new author",
                        //     time: 0,
                        //     keywords: [],
                        //     text: "new text",
                        //     topics: [],
                        //     attachments: [],
                        // }
                    ]);
                    const url = `/thread?id=${threadId}`;
                    navigate(url)
                }}
                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: "rgba(235, 235, 235, 1)",
                    cursor: "pointer",
                    marginRight: 10,
                    borderRadius: 5,
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(220, 220, 220, 1)";
                    }
                }}

                onMouseLeave={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(235, 235, 235, 1)";
                    }
                }}
            >
                {"Add New Log"}
            </div>
        )
    }


    _ElementThreadThumbnail = ({ threadId, threadData, index }: { threadId: string, threadData: type_thread, index: number }) => {

        const mainPostData = threadData[0];
        const title = mainPostData["title"];
        const author = mainPostData["author"];
        const time = mainPostData["time"];
        const text = mainPostData["text"];
        const topics = mainPostData["topics"];
        const navigate = useNavigate();

        return (
            <tr style={{
                backgroundColor: index % 2 === 1 ? "rgba(255,255,255,1)" : "rgba(235, 235, 235, 1)",
            }}>
                <this._ElementThreadThumbnailTopics threadId={threadId} threadData={threadData} index={index}></this._ElementThreadThumbnailTopics>
                <this._ElementThreadThumbnailTitle threadId={threadId} threadData={threadData} index={index}></this._ElementThreadThumbnailTitle>
                <this._ElementThreadThumbnailAuthor threadId={threadId} threadData={threadData} index={index}></this._ElementThreadThumbnailAuthor>
                <this._ElementThreadThumbnailTime threadId={threadId} threadData={threadData} index={index}></this._ElementThreadThumbnailTime>
            </tr>
        )
    }

    _ElementThreadThumbnailTitle = ({ threadId, threadData, index }: { threadId: string, threadData: type_thread, index: number }) => {
        const navigate = useNavigate();
        const mainPostData = threadData[0];
        const title = mainPostData["title"];
        const elementRef = React.useRef<any>(null);
        return (
            <td style={{
                padding: 10,
            }}>
                <div
                    ref={elementRef}
                    onClick={async (event: any) => {
                        if (this.getThread().getState() === "adding-post" || this.getThread().getState() === "adding-thread") {
                            const confirmed = window.confirm("Do you want to disgard the post?");
                            if (confirmed === false) {
                                return;
                            }
                            this.getThread().setState("view");
                        }

                        this.getThread().setThreadData(threadId, threadData);
                        const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                        navigate(url, { state: nanoid() })
                    }}
                    style={{
                        cursor: "pointer",
                        display: "inline-flex",
                    }}
                    onMouseEnter={() => {
                        if (elementRef.current !== null) {
                            elementRef.current.style["color"] = "rgba(0, 121, 52, 1)";
                        }
                    }}
                    onMouseLeave={() => {
                        if (elementRef.current !== null) {
                            elementRef.current.style["color"] = "rgba(0, 0, 0, 1)";
                        }
                    }}
                >
                    {title}
                </div>
            </td>
        )
    }

    _ElementThreadThumbnailTopics = ({ threadId, threadData, index }: { threadId: string, threadData: type_thread, index: number }) => {
        const navigate = useNavigate();
        const mainPostData = threadData[0];
        const topics = mainPostData["topics"];
        const elementRef = React.useRef<any>(null);
        return (
            <td style={{
                padding: 10,
            }}>
                <div
                    ref={elementRef}
                    onClick={async (event: any) => {
                        // todo:
                        // this.setThreadData(threadData);
                        // const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                        // navigate(url, { state: nanoid() })
                    }}
                    style={{
                        cursor: "pointer",
                        display: "inline-flex",
                    }}
                    onMouseEnter={() => {
                        if (elementRef.current !== null) {
                            elementRef.current.style["color"] = "rgba(0, 121, 52, 1)";
                        }
                    }}
                    onMouseLeave={() => {
                        if (elementRef.current !== null) {
                            elementRef.current.style["color"] = "rgba(0, 0, 0, 1)";
                        }
                    }}
                >
                    {topics}
                </div>
            </td>
        )
    }


    _ElementThreadThumbnailAuthor = ({ threadId, threadData, index }: { threadId: string, threadData: type_thread, index: number }) => {
        const navigate = useNavigate();
        const mainPostData = threadData[0];
        const author = mainPostData["author"];
        const elementRef = React.useRef<any>(null);
        return (
            <td style={{
                padding: 10,
            }}>
                <div
                    ref={elementRef}
                    onClick={async (event: any) => {
                        // todo:
                        // this.setThreadData(threadData);
                        // const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                        // navigate(url, { state: nanoid() })
                    }}
                    style={{
                        cursor: "pointer",
                        display: "inline-flex",
                    }}
                    onMouseEnter={() => {
                        if (elementRef.current !== null) {
                            elementRef.current.style["color"] = "rgba(0, 121, 52, 1)";
                        }
                    }}
                    onMouseLeave={() => {
                        if (elementRef.current !== null) {
                            elementRef.current.style["color"] = "rgba(0, 0, 0, 1)";
                        }
                    }}
                >
                    {author}
                </div>
            </td>
        )
    }

    _ElementThreadThumbnailTime = ({ threadId, threadData, index }: { threadId: string, threadData: type_thread, index: number }) => {
        const navigate = useNavigate();
        const mainPostData = threadData[0];
        const time = mainPostData["time"];
        const elementRef = React.useRef<any>(null);
        return (
            <td style={{
                padding: 10,
            }}>
                <div
                    ref={elementRef}
                    style={{
                        display: "inline-flex",
                    }}
                >
                    {new Date(time).toISOString()}
                </div>
            </td>
        )
    }

    _ElementThreadWrapper = () => {
        const location = useLocation();

        return this.getThread().getElement();
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
                backgroundColor: "green",
                width: "90%",
            }}>
                <table style={{
                }}>
                    <tbody>
                        {Object.entries(this.getThreadsData()).map(([threadId, threadData], index) => {
                            return (
                                <this._ElementThreadThumbnail index={index} threadId={threadId} threadData={threadData} key={threadId}></this._ElementThreadThumbnail>
                            )
                        })}
                    </tbody>
                </table>
            </div>
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

    getThread = () => {
        return this._thread;
    }
}


const app = new App();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(app.getElement());
