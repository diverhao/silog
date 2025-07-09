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

export class SearchBar {
    private _app: App;
    authors: string[] = [];
    keywords: string[] = [];
    timeRange: [number, number] = [0, 3751917376000];
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


    _ElementAuthors = () => {
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
                        this.authors = event.target.value.trim().split(" ");
                    }}
                >
                </input>
            </form>
        )
    }

    _ElementKeywords = () => {
        // const [keywordsStr, setKeywordsStr] = React.useState("");
        // this.setKeywordsStr = setKeywordsStr;
        const [, forceUpdate] = React.useState({});
        return (
            <form onSubmit={(event: any) => {
                event.preventDefault();
            }}
                style={{
                    width: "100%",
                    // marginLeft: 15,
                    marginRight: 15,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
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
                    }}
                    value={this.obtainKeywords()}
                    onChange={(event: any) => {
                        // setKeywordsStr(event.target.value);
                        // this.keywordsStr = event.target.value;
                        if (event.target.value.trim() === "") {
                            this.keywords = [];
                        } else {
                            this.keywords = event.target.value.trim().split(" ");
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

                    const searchQuery: Record<string, any> = {
                        timeRange: this.timeRange,
                        authors: this.authors,
                        keywords: this.keywords,
                        // topics: [],
                        // startingCount: 0,
                        // count: 50,
                    }

                    const searchQueryStr: Record<string, any> = {
                        timeRange: searchQuery["timeRange"].join(" ").trim(),
                    }
                    if (searchQuery["authors"].length > 0) {
                        searchQueryStr["authors"] = searchQuery["authors"].join(" ").trim();
                    }
                    if (searchQuery["keywords"].length > 0) {
                        searchQueryStr["keywords"] = searchQuery["keywords"].join(" ").trim();
                    }


                    const response = await fetch("/search",

                        {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(searchQuery),
                        }
                    )
                    const data = await response.json();
                    this.getApp().setThreadsData(data.result);
                    const url = `/search?${new URLSearchParams(searchQueryStr)}`;
                    navigate(url, { state: nanoid() });
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
                    fontFamily: "sans-serif",
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
                    color: isStartTime ? this.timeRange[0] === 0 ? "rgba(150, 150, 150, 1)" : "" : this.timeRange[1] === 3751917376000 ? "rgba(150, 150, 150, 1)" : "",
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
                    {isStartTime ? this.timeRange[0] === 0 ? "any time" : this.convertTime(this.timeRange[0]) : this.timeRange[1] === 3751917376000 ? "any time" : this.convertTime(this.timeRange[1])}
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
        return isStartTime ? this.timeRange[0] === 0 ? new Date() : new Date(this.timeRange[0]) : this.timeRange[1] === 3751917376000 ? new Date() : new Date(this.timeRange[1]);
    }

    obtainKeywords = () => {
        return this.keywords.length === 0 ? "" : this.keywords.join(" ");
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
                                this.timeRange[0] = newDate.getTime();
                            } else {
                                newDate.setHours(23, 59, 59, 999); // 23:59:59.999
                                this.timeRange[1] = newDate.getTime();
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
                            this.timeRange[0] = 0;
                        } else {
                            this.timeRange[1] = 3751917376000;
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

}