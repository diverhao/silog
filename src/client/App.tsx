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
// Define the array first
export const allTopics = ["control", "operation", "cryo", "magnet", "physics"] as const;

// Derive the type from the array
export type type_topic = (typeof allTopics)[number];
// export type type_topic = "control" | "operation" | "cryo" | "magnet" | "physics";

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
    _threadsMatchCount: number = 0;

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
        const [fullPageMessageType, setFullPageMessageType] = React.useState<"error" | "warning" | "info" | "">("");
        this.setFullPageMessageType = setFullPageMessageType;

        return (
            <div style={{
            }}>
                <this._ElementTopBar></this._ElementTopBar>
                <Outlet />
                <this._ElementFullPageMessage type={fullPageMessageType}></this._ElementFullPageMessage>
            </div>
        );
    }

    setFullPageMessageType = (type: "error" | "warning" | "info" | "") => { };
    fullPageMessageText = "";

    _ElementTopBar = () => {
        const navigate = useNavigate();

        return (
            <div
                className='no-print'
                style={{
                    // marginTop: 15,
                    // paddingTop: 30,
                    // backgroundColor: "red",
                }}>
                <div style={{
                    width: "100%",
                    height: 100,
                    paddingLeft: 50,
                    display: "inline-flex",
                    alignItems: "center",
                    position: "fixed",
                    backgroundColor: "white",
                    paddingBottom: 20,
                    paddingTop: 15,
                    // backgroundColor: "red",
                    // marginTop: 30,
                }}>
                    <div style={{
                        width: "90%",
                        display: "inline-flex",
                        flexDirection: 'row',
                        height: "100%",
                        alignItems: "center",

                    }}>
                        <img src="/logo.png" style={{
                            minWidth: 200,
                            maxWidth: 200,
                            cursor: "pointer",
                        }}
                            // the logo image: clear all search critia, search and go to "/"
                            onMouseDown={async () => {
                                const confirmToGo = this.getThread().confirmRouteAway("Do you want to disgard the post?");
                                if (confirmToGo === false) {
                                    return;
                                }

                                this.getSearchBar().resetSearchQuery();
                                navigate("/")
                            }}
                        ></img>
                        {this.getSearchBar().getElement()}
                    </div>
                </div>
                <div style={{
                    width: "90%",
                    height: 100,
                    paddingLeft: 50,
                    display: "inline-flex",
                    alignItems: "center",
                    backgroundColor: "white",
                    paddingBottom: 20,
                    paddingTop: 15,

                }}>
                </div>
            </div>
        )
    }

    _ElementFullPageMessage = ({ type }: { type: "error" | "warning" | "info" | "" }) => {
        if (type === "") {
            return null;
        }
        return (
            <div style={{
                display: "inline-flex",
                position: "absolute",
                left: 0,
                top: 0,
                width: "100%",
                height: "100%",
                zIndex: 10000,
                backdropFilter: "blur(10px)",
                backgroundColor: "rgba(180, 180, 180, 0.3)",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
            }}>
                <div style={{
                    color: type === "error" ? "red" : type === "warning" ? "blue" : type === "info" ? "green" : "black",
                    fontSize: 36,
                    marginBottom: 30,
                }}>
                    {type.toUpperCase()}
                </div>
                <div style={{
                    marginBottom: 30,
                }}>
                    {this.fullPageMessageText}
                </div>
                <div
                    onClick={() => { this.setFullPageMessageType("") }}
                    style={{
                        display: "inline-flex",
                        padding: 5,
                        paddingLeft: 20,
                        paddingRight: 20,
                        backgroundColor: "rgba(138, 206, 247, 1)",
                        borderRadius: 5,
                        cursor: "pointer",
                    }}
                >
                    OK
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
                    // padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: "rgba(235, 235, 235, 1)",
                    cursor: "pointer",
                    // marginRight: 200,
                    marginLeft: 30,
                    height: 40,
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

        return (
            <tr style={{
                backgroundColor: index % 2 === 1 ? "rgba(255,255,255,1)" : "rgba(235, 235, 235, 1)",
            }}>
                {/* <this._ElementThreadThumbnailTopics threadId={threadId} threadData={threadData} index={index}></this._ElementThreadThumbnailTopics> */}
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
                        const confirmToGo = this.getThread().confirmRouteAway("Do you want to disgard the post?");
                        if (confirmToGo === false) {
                            return;
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
                    const confirmToGo = this.getThread().confirmRouteAway("Do you want to disgard the post?");
                    if (confirmToGo === false) {
                        return;
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
                        const confirmToGo = this.getThread().confirmRouteAway("Do you want to disgard the post?");
                        if (confirmToGo === false) {
                            return;
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
                        whiteSpace: "nowrap",
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
        const staringCountStr = params.get('startingCount');
        const keywordsStr = params.get('keywords');
        const [, forceUpdate] = React.useState({});

        useEffect(() => {

            if (location.pathname === "/") {
                const confirmToGo = this.getThread().confirmRouteAway("Do you want to disgard the post?");
                if (confirmToGo === false) {
                    return;
                }

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

                if (staringCountStr !== null) {
                    searchQuery["startingCount"] = parseInt(staringCountStr);
                } else {
                    searchQuery["startingCount"] = 0;
                }


                doSearch(searchQuery).then((data: any) => {
                    if (data !== undefined) {
                        this.setThreadsData(data.result);
                        this.setThreadsMatchCount(data["matchCount"]);
                        forceUpdate({})
                    }
                })
            }

        }, [location.search, location.pathname]);

        return (
            <div style={{
                paddingLeft: 50,
                paddingRight: 50,
                backgroundColor: "rgba(0,0,0,0)",
                width: "90%",
            }}>
                <this._ElementPageIndices></this._ElementPageIndices>
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

    _ElementPageIndices = () => {
        const matchCount = this.getThreadsMatchCount();
        const startingCount = this.getSearchBar().getSearchQuery()["startingCount"];
        const showCountMin = Math.max(0, startingCount - 250);
        const showCountMax = Math.min(showCountMin + 500, matchCount);
        const numPages = (showCountMax - showCountMin) / 50;

        const threadsPerPage = 50;
        const pageList: number[] = [];
        for (let i = showCountMin; i < showCountMax; i += threadsPerPage) {
            pageList.push(i);
        }

        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "row",
                marginBottom: 20,
                alignItems: "center",
            }}>
                {pageList.map((pageStartingCount: number) => {
                    return (
                        <this._ElementPageIndex startingCount={pageStartingCount}></this._ElementPageIndex>
                    )
                })}
                <this._ElementAddThreadButton></this._ElementAddThreadButton>
            </div>
        )
    }

    _ElementPageIndex = ({ startingCount }: { startingCount: number }) => {
        const elementRef = React.useRef<any>(null);
        const navigate = useNavigate();
        return (
            <div
                ref={elementRef}
                style={{
                    width: 50,
                    height: 40,
                    margin: 5,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    borderRadius: 5,
                    backgroundColor: this.getSearchBar().getSearchQuery()["startingCount"] === startingCount ? "rgba(235,235,235,1)" : "rgba(235,235,235,0)",
                    border: "solid 1px rgba(100, 100, 100, 1)",
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = this.getSearchBar().getSearchQuery()["startingCount"] === startingCount ? "rgba(235,235,235,1)" : "rgba(235,235,235,1)";
                    }
                }}
                onMouseLeave={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = this.getSearchBar().getSearchQuery()["startingCount"] === startingCount ? "rgba(235,235,235,1)" : "rgba(235,235,235,0)";
                    }
                }}
                onMouseDown={async () => {

                    const confirmToGo = this.getThread().confirmRouteAway("Do you want to disgard the post?");
                    if (confirmToGo === false) {
                        return;
                    }
                    const searchQuery = this.getSearchBar().getSearchQuery();
                    searchQuery["startingCount"] = startingCount;
                    const data = await doSearch(searchQuery);
                    this.setThreadsData(data.result);
                    this.setThreadsMatchCount(data["matchCount"]);
                    const url = convertSearchQueryToUrl(searchQuery);
                    navigate(url);
                }}
            >
                {Math.round(startingCount / 50 + 1)}
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

    getThreadsMatchCount = () => {
        return this._threadsMatchCount;
    }

    setThreadsMatchCount = (newCount: number) => {
        this._threadsMatchCount = newCount;
    }

}


const app = new App();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(app.getElement());
