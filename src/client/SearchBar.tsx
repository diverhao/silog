import { App } from "./App";
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Outlet, Link } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // import default styles
import '../server/resources/Calendar.css'; // import default styles
import { Value } from "react-calendar/dist/shared/types";

export class SearchBar {
    private _app: App;
    authorsStr: string = "";
    keywordsStr: string = "";
    timeStart: number = 0;
    timeEnd: number = 3751917376000
    constructor(app: App) {
        this._app = app;
        window.addEventListener("mousedown", () => {
            this.setShowCalendarStartTime(false);
            this.setShowCalendarEndTime(false);
        })
    }


    _ElementAuthors = () => {
        const [authorsStr1, setAuthorsStr1] = React.useState(this.authorsStr);
        return (
            <form onSubmit={(event: any) => {
                event.preventDefault();
            }}>
                <input
                    value={authorsStr1}
                    onChange={(event: any) => {
                        setAuthorsStr1(event.target.value);
                        this.authorsStr = event.target.value;
                    }}
                >
                </input>
            </form>
        )
    }

    _ElementKeywords = () => {
        const [keywordsStr, setKeywordsStr] = React.useState(this.keywordsStr);
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
                    value={keywordsStr}
                    onChange={(event: any) => {
                        setKeywordsStr(event.target.value);
                        this.keywordsStr = event.target.value;
                    }}
                    placeholder="Search title and full text."
                >
                </input>
            </form>
        )
    }

    _ElementSearchButton = () => {
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
                    const searchQuery: Record<string, any> = {};
                    searchQuery["timeRange"] = [0, Date.now()].join(" ").trim();

                    let keywordsStr = this.keywordsStr;
                    if (keywordsStr.trim() !== "") {
                        searchQuery["keywords"] = keywordsStr.trim();
                    }

                    let authorsStr = this.authorsStr;
                    if (authorsStr.trim() !== "") {
                        searchQuery["authors"] = authorsStr.trim();
                    }

                    const response = await fetch(`/search?${new URLSearchParams(searchQuery)}`)
                    const data = await response.json();
                    console.log(data)
                }}
            >
                &#128269;
            </div>
        )
    }


    setShowCalendarStartTime = (show: boolean) => { };
    setShowCalendarEndTime = (show: boolean) => { };

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
                    {isStartTime ? this.timeStart === 0 ? "any time" : this.convertTime(this.timeStart) : this.timeEnd === 3751917376000 ? "any time" : this.convertTime(this.timeEnd)}
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

    _ElementCalendar = ({ showCalendar, setShowCalendar, forceUpdate, isStartTime }: any) => {
        const [date, setDate] = useState(new Date());
        const elementDoneButton = React.useRef<any>(null);
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
                            setDate(newDate);
                            if (isStartTime) {
                                this.timeStart = newDate.getTime();
                            } else {
                                this.timeEnd = newDate.getTime();
                            }
                            forceUpdate({})
                        } else {
                            // should not happen
                        }

                    }}
                    value={date}
                />
                {/* <p>Selected date: {date.toDateString()}</p> */}
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