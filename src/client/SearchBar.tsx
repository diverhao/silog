import { App, type_search_query } from "./App";
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // import default styles
import '../server/resources/Calendar.css'; // import default styles
import { Value } from "react-calendar/dist/shared/types";
import { nanoid } from 'nanoid';
import { convertSearchQueryToUrl, doSearch, farFuture } from "./Shared";

export class SearchBar {
    private _app: App;
    // search query
    // author: string = "";
    // topic: string = "";
    // keywords: string[] = [];
    // timeRange: [number, number] = [0, farFuture];

    _searchQuery: type_search_query = {
        author: "",
        topic: "",
        keywords: [],
        timeRange: [0, farFuture],
        startingCount: 0,
        count: 50,
    };

    setShowCalendarStartTime = (show: boolean) => { };
    setShowCalendarEndTime = (show: boolean) => { };
    forceUpdate = (input: any) => { };

    constructor(app: App) {
        this._app = app;
        window.addEventListener("mousedown", () => {
            this.setShowCalendarStartTime(false);
            this.setShowCalendarEndTime(false);
        })
    }


    _ElementAuthor = () => {
        const [authorsStr, setAuthorsStr] = React.useState("");
        return (
            <form onSubmit={(event: any) => {
                event.preventDefault();
            }}>
                <input
                    value={authorsStr}
                    onChange={(event: any) => {
                        setAuthorsStr(event.target.value);
                        // this.authorsStr = event.target.value;
                        this.getSearchQuery().author = event.target.value;
                    }}
                >
                </input>
            </form>
        )
    }

    _ElementKeywords = () => {
        const navigate = useNavigate();
        const [, forceUpdate] = React.useState({});
        return (
            <form onSubmit={async (event: any) => {
                event.preventDefault();

                const searchQuery = this.getSearchQuery();


                if (this.getApp().getThread().getState() === "adding-post" || this.getApp().getThread().getState() === "adding-thread") {
                    const confirmed = window.confirm("Do you want to disgard the post?");
                    if (confirmed === false) {
                        return;
                    }
                    this.getApp().getThread().setState("view");
                }
                const data = await doSearch(searchQuery);
                this.getApp().setThreadsData(data.result);
                const url = convertSearchQueryToUrl(searchQuery);
                navigate(url);
            }}
                style={{
                    width: "100%",
                    // marginLeft: 15,
                    marginRight: 15,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: "Inter, sans-serif",
                }}
            >
                <input
                    style={{
                        // backgroundColor: "rgba(0,0,0,0)",
                        outline: "none",
                        border: "none",
                        width: "100%",
                        // backgroundColor: "yellow",
                        fontSize: 18,
                        margin: 0,
                        fontFamily: "Inter, sans-serif",
                    }}
                    value={this.obtainKeywords()}
                    onChange={(event: any) => {
                        // setKeywordsStr(event.target.value);
                        // this.keywordsStr = event.target.value;
                        if (event.target.value.trim() === "") {
                            this.getSearchQuery()["keywords"] = [];
                        } else {
                            this.getSearchQuery()["keywords"] = event.target.value.trim().split(" ");
                        }
                        this.forceUpdate({});
                    }}
                    placeholder="Search title and full text."
                >
                </input>
            </form>
        )
    }

    _ElementSearchButton = () => {

        const navigate = useNavigate();

        const elementRef = React.useRef<any>(null);
        return (
            <div
                ref={elementRef}
                style={{
                    fontSize: 18,
                    width: 34,
                    height: 34,
                    maxWidth: 34,
                    maxHeight: 34,
                    minWidth: 34,
                    minHeight: 34,
                    borderRadius: 17,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(168, 196, 246, 0)",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(event: any) => {
                    event.preventDefault();
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(168, 196, 246, 1)";
                    }
                }}
                onMouseLeave={(event: any) => {
                    event.preventDefault();
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(168, 196, 246, 0)";
                    }
                }}
                onClick={async (event: any) => {
                    event.preventDefault();
                    if (this.getApp().getThread().getState() === "adding-post" || this.getApp().getThread().getState() === "adding-thread") {
                        const confirmed = window.confirm("Do you want to disgard the post?");
                        if (confirmed === false) {
                            return;
                        }
                        this.getApp().getThread().setState("view");
                    }
                    const searchQuery = this.getSearchQuery();
                    const url = convertSearchQueryToUrl(searchQuery);
                    navigate(url);
                }}
            >
                &#128269;
            </div>
        )
    }



    _ElementTime = ({ isStartTime }: any) => {
        const [showCalendar, setShowCalendar] = React.useState(false);
        if (isStartTime) {
            this.setShowCalendarStartTime = setShowCalendar;
        } else {
            this.setShowCalendarEndTime = setShowCalendar;
        }

        const [, forceUpdate] = React.useState({});

        return (
            <div
                style={{
                    position: "relative",
                }}
            >
                <div style={{
                    height: 40,
                    width: "8em",
                    border: "1px solid black",
                    borderRadius: 20,
                    // borderBottom: "solid 2px rgba(200, 200, 255, 0.5)",
                    // width: "5em",
                    marginLeft: 5,
                    marginRight: 5,
                    cursor: "text",
                    position: "relative",
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: isStartTime ? this.getSearchQuery().timeRange[0] === 0 ? "rgba(150, 150, 150, 1)" : "" : this.getSearchQuery().timeRange[1] === farFuture ? "rgba(150, 150, 150, 1)" : "",
                }}
                    onMouseDown={(event: any) => {
                        event?.stopPropagation();
                        setShowCalendar(!showCalendar);
                        if (isStartTime) {
                            this.setShowCalendarEndTime(false);
                        } else {
                            this.setShowCalendarStartTime(false);
                        }

                    }}
                >
                    {isStartTime ? this.getSearchQuery().timeRange[0] === 0 ? "any time" : this.convertTime(this.getSearchQuery().timeRange[0]) : this.getSearchQuery().timeRange[1] === farFuture ? "any time" : this.convertTime(this.getSearchQuery().timeRange[1])}
                </div>
                <this._ElementCalendar
                    showCalendar={showCalendar}
                    setShowCalendar={setShowCalendar}
                    forceUpdate={forceUpdate}
                    isStartTime={isStartTime}
                >
                </this._ElementCalendar>
            </div>
        )
    }

    obtainCalenderDate = (isStartTime: boolean) => {
        return isStartTime ? this.getSearchQuery().timeRange[0] === 0 ? new Date() : new Date(this.getSearchQuery().timeRange[0]) : this.getSearchQuery().timeRange[1] === farFuture ? new Date() : new Date(this.getSearchQuery().timeRange[1]);
    }

    obtainKeywords = () => {
        return this.getSearchQuery().keywords.length === 0 ? "" : this.getSearchQuery().keywords.join(" ");
    }

    _ElementCalendar = ({ showCalendar, setShowCalendar, forceUpdate, isStartTime }: any) => {
        const elementDoneButton = React.useRef<any>(null);
        const elementClearButton = React.useRef<any>(null);
        if (showCalendar === false) {
            return null
        }


        return (
            <div style={{
                position: "absolute",
                left: 10,
                top: 50,
                fontSize: 18,
                zIndex: 10000,
                backgroundColor: "white",
            }}
                onMouseDown={(event: any) => {
                    event.stopPropagation();
                }}
            >

                <Calendar
                    onChange={(newDate: Value) => {
                        if (newDate instanceof Date) {
                            // setDate(newDate);
                            if (isStartTime) {
                                newDate.setHours(0, 0, 0, 0); // 00:00:00.000
                                this.getSearchQuery().timeRange[0] = newDate.getTime();
                            } else {
                                newDate.setHours(23, 59, 59, 999); // 23:59:59.999
                                this.getSearchQuery().timeRange[1] = newDate.getTime();
                            }
                            forceUpdate({})
                        } else {
                            // should not happen
                        }

                    }}
                    value={this.obtainCalenderDate(isStartTime)}
                />
                <div
                    ref={elementDoneButton}
                    onMouseDown={() => {
                        setShowCalendar(false);
                    }}
                    style={{
                        display: "inline-flex",
                        backgroundColor: "rgba(168, 196, 246, 1)",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        padding: 10,
                        borderRadius: 5,
                        marginTop: 10,
                        marginRight: 10,
                    }}
                    onMouseEnter={() => {
                        if (elementDoneButton.current !== null) {
                            elementDoneButton.current.style["backgroundColor"] = "rgba(168,150,255,1)";
                        }
                    }}
                    onMouseLeave={() => {
                        if (elementDoneButton.current !== null) {
                            elementDoneButton.current.style["backgroundColor"] = "rgba(168,196,246,1)";
                        }
                    }}
                >
                    Done
                </div>

                <div
                    ref={elementClearButton}
                    onMouseDown={() => {
                        if (isStartTime) {
                            this.getSearchQuery().timeRange[0] = 0;
                        } else {
                            this.getSearchQuery().timeRange[1] = farFuture;
                        }
                        setShowCalendar(false);

                    }}
                    style={{
                        display: "inline-flex",
                        backgroundColor: "rgba(168, 196, 246, 1)",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                        padding: 10,
                        borderRadius: 5,
                        marginTop: 10,
                    }}
                    onMouseEnter={() => {
                        if (elementClearButton.current !== null) {
                            elementClearButton.current.style["backgroundColor"] = "rgba(168,150,255,1)";
                        }
                    }}
                    onMouseLeave={() => {
                        if (elementClearButton.current !== null) {
                            elementClearButton.current.style["backgroundColor"] = "rgba(168,196,246,1)";
                        }
                    }}
                >
                    Clear
                </div>
            </div>
        );
    }

    _ElementTimes = () => {
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "row",
                fontSize: 18,
                fontFamily: "sans-serif",
                alignItems: "center",
            }}>

                <this._ElementTime isStartTime={true}></this._ElementTime>
                <img src="/rightArrow.svg"
                    style={{
                        height: 30,
                    }}
                ></img>

                <this._ElementTime isStartTime={false}></this._ElementTime>
            </div>
        )
    }


    _Element = () => {
        const [, forceUpdate] = React.useState({});
        this.forceUpdate = forceUpdate;
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "row",
                fontFamily: "sans-serif",
                alignItems: "center",
                marginLeft: 15,
                width: "80%",
            }}>
                <this._ElementTimes></this._ElementTimes>
                <div style={{
                    display: "inline-flex",
                    flexDirection: "row",
                    height: 40,
                    backgroundColor: "rgba(255,255,255,1)",
                    borderRadius: 20,
                    border: "solid 1px rgba(0,0,0,1)",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: 15,
                    paddingRight: 3,
                    marginRight: 15,
                    width: "40%",
                }}>
                    <this._ElementKeywords></this._ElementKeywords>
                    <this._ElementSearchButton></this._ElementSearchButton>
                </div>
            </div>
        )
    }

    getElement = () => {
        return <this._Element></this._Element>
    }


    getApp = () => {
        return this._app;
    }


    // convert ms-since-epoch to date in format of 2025-12-23
    convertTime = (msSinceEpoch: number) => {
        const date = new Date(msSinceEpoch);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getSearchQuery = () => {
        return this._searchQuery;
    }

    resetSearchQuery = () => {
        const searchQuery = this.getSearchQuery();
        searchQuery["author"] = "";
        searchQuery["topic"] = "";
        searchQuery["keywords"] = [];
        searchQuery["timeRange"] = [0, farFuture];
        searchQuery["startingCount"] = 0;
        searchQuery["count"] = 50;
    }

}