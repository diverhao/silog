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
    useSearchParams,
} from 'react-router-dom';
import { nanoid } from 'nanoid';
import { Thread } from './Thread';
import { v4 as uuidv4 } from "uuid";
import { doSearch, convertSearchQueryToUrl, getTimeStr, farFuture } from './Shared';


export type type_search_query = {
    timeRange: [number, number], // time range
    author: string, // match author, if [], match any author
    keywords: string[], // match title and text, if [], match any text
    topic: string, // match topics, e.g. cryo, magnet, operation, if [], match any topic
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
    text: string,
    topics: type_topic[], // could be multiple system, vacuum, cryo, admin, control, magnet, ...
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

    _threadsData: type_threads = {};
    _thread: Thread = new Thread(this);
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
                        // the logo image: clear all search critia, search and go to "/"
                        onMouseDown={async () => {
                            this.getSearchBar().resetSearchQuery();
                            navigate("/")
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
                    this.getThread().setState("adding-thread");
                    const threadId = uuidv4();
                    this.getThread().setThreadData(threadId, []);
                    const url = `/thread?id=${threadId}&state=adding-thread`;
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
                    whiteSpace: "nowrap",
                    justifyContent: "center",
                    alignItems: "center",
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
                        this.getThread().setThreadData(threadId, []);
                        const url = `/thread?${new URLSearchParams({ id: threadId })}`;
                        navigate(url);
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
            </td >
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
                    style={{
                        cursor: "pointer",
                        display: "inline-flex",
                        flexDirection: "row",
                    }}
                >
                    {topics.map((topic: string, index: number) => {
                        return (
                            <this._ElementThreadThumbnailTopic topic={topic} key={topic + `${index}`}></this._ElementThreadThumbnailTopic>
                        )
                    })}
                </div>
            </td>
        )
    }

    _ElementThreadThumbnailTopic = ({ topic }: { topic: string }) => {
        const navigate = useNavigate();
        const elementRef = React.useRef<any>(null);
        return (
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
                    const searchQuery = this.getSearchBar().getSearchQuery();
                    searchQuery["topic"] = topic;
                    const url = convertSearchQueryToUrl(searchQuery);
                    navigate(url)

                }}
                style={{
                    cursor: "pointer",
                    display: "inline-flex",
                    marginRight: 8,
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
                {topic}
            </div>
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
                        if (this.getThread().getState() === "adding-post" || this.getThread().getState() === "adding-thread") {
                            const confirmed = window.confirm("Do you want to disgard the post?");
                            if (confirmed === false) {
                                return;
                            }
                            this.getThread().setState("view");
                        }

                        const searchQuery = this.getSearchBar().getSearchQuery();
                        searchQuery["author"] = author;
                        const url = convertSearchQueryToUrl(searchQuery);
                        navigate(url)
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
                    {getTimeStr(time)}
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
        const navigate = useNavigate();
        const location = useLocation();

        const params = new URLSearchParams(location.search)
        const timeRangeStr = params.get('timeRange');
        const authorStr = params.get('author');
        const topicStr = params.get('topic');
        const keywordsStr = params.get('keywords');
        const [, forceUpdate] = React.useState({});

        useEffect(() => {

            if (location.pathname === "/") {
                this.getSearchBar().resetSearchQuery();
                const searchQuery = this.getSearchBar().getSearchQuery();
                const url = convertSearchQueryToUrl(searchQuery);
                navigate(url)
            } else if (location.pathname === "/search") {
                const searchQuery = this.getSearchBar().getSearchQuery();
                if (timeRangeStr !== null) {
                    const timeRangeStrArray = timeRangeStr.trim().split(" ");
                    if (timeRangeStrArray.length === 2) {
                        const tStart = parseInt(timeRangeStrArray[0]);
                        const tEnd = parseInt(timeRangeStrArray[1]);
                        if (!isNaN(tStart) && !isNaN(tEnd)) {
                            searchQuery["timeRange"] = [Math.min(tStart, tEnd), Math.max(tStart, tEnd)];
                        }
                    }
                } else {
                    searchQuery["timeRange"] = [0, farFuture];
                }

                if (keywordsStr !== null) {
                    searchQuery["keywords"] = keywordsStr.trim().split(" ");
                } else {
                    searchQuery["keywords"] = [];
                }

                if (topicStr !== null) {
                    searchQuery["topic"] = topicStr.trim();
                } else {
                    searchQuery["topic"] = "";
                }

                if (authorStr !== null) {
                    searchQuery["author"] = authorStr.trim();
                } else {
                    searchQuery["author"] = "";
                }


                doSearch(searchQuery).then((data: any) => {
                    if (data !== undefined) {
                        this.setThreadsData(data.result);
                        const url = convertSearchQueryToUrl(searchQuery);
                        forceUpdate({})
                    }
                })
            }

        }, [location.search, location.pathname]);

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
