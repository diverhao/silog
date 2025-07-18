import { allTopics, App, type_search_query, type_topic } from "./App";
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // import default styles
import '../server/resources/Calendar.css'; // import default styles
import { Value } from "react-calendar/dist/shared/types";
import { nanoid } from 'nanoid';
import { convertSearchQueryToUrl, convertTime, doSearch, farFuture, hiDpiFontSizeScale, hiDpiInputBoxBorderHeight } from "./Shared";

export class SearchBar {
    private _app: App;

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
    setShowTopicChoices = (show: boolean) => { };
    forceUpdate = (input: any) => { };
    // _ElementAddThreadButton: any;
    // only for mobile device
    _setLogoutButtonText = (input: string) => { console.log("aaaaa") };

    setShowSearchScreen = (input: boolean) => { };

    constructor(app: App) {
        this._app = app;
        // this._ElementAddThreadButton = this._app._ElementAddThreadButton;
        window.addEventListener("mousedown", () => {
            this.setShowCalendarStartTime(false);
            this.setShowCalendarEndTime(false);
            this.setShowTopicChoices(false);
        })

        if (!this._app.isDesktop()) {
            // Check if the CSS is already loaded
            // if ([...document.styleSheets].some(sheet => sheet.href && sheet.href.includes(href))) {
            //     return;
            // }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = "/resources/Calendar-phone.css";
            link.type = 'text/css';
            document.head.appendChild(link);

        }
    }


    _ElementAuthor = () => {
        const navigate = useNavigate();
        const [author, setAuthor] = React.useState("");
        const [, forceUpdate] = React.useState({});
        const showClearButton = !(this.getSearchQuery()["author"] === "");

        const onMouseDownOnClearButton = () => {
            setAuthor("");
            this.getSearchQuery()["author"] = "";
        }
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "row",
                height: this.getApp().isDesktop() ? 40 : hiDpiInputBoxBorderHeight,
                // backgroundColor: "rgba(255,255,1,1)",
                borderRadius: 20,
                border: "solid 1px rgba(0,0,0,1)",
                justifyContent: "flex-start",
                alignItems: "center",
                paddingLeft: this.getApp().isDesktop() ? 15 : 0,
                // paddingRight: 3,
                // marginRight: 5,
                minWidth: "10em",
                maxWidth: "10em",
                marginLeft: this.getApp().isDesktop() ? 5 : 0,

                marginTop: 15,
                marginBottom: 15,
                boxSizing: "border-box",
                marginRight: 5,
                paddingRight: 3,

                flex: this.getApp().isDesktop() ? 1 : "",

            }}>

                <form onSubmit={async (event: any) => {
                    event.preventDefault();
                }}
                    style={{
                        width: "80%",
                        // marginLeft: 15,
                        marginRight: 0,
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
                            fontSize: this.getApp().isDesktop() ? 16 : "100%",
                            margin: 0,
                            fontFamily: "Inter, sans-serif",

                        }}
                        value={this.getSearchQuery()["author"]}
                        onChange={(event: any) => {
                            setAuthor(event.target.value);
                            this.getSearchQuery().author = event.target.value;
                        }}
                        placeholder="All authors"
                    >
                    </input>
                </form>
                {showClearButton === false ? "" : <this._ElementClearButton onMouseDown={onMouseDownOnClearButton}></this._ElementClearButton>}

            </div>
        )
    }

    _ElementTopic = () => {
        const navigate = useNavigate();
        const [topic, setTopic] = React.useState("");
        const [, forceUpdate] = React.useState({});
        const [showChoices, setShowChoices] = React.useState(false);
        this.setShowTopicChoices = setShowChoices;
        const showClearButton = !(this.getSearchQuery()["topic"] === "" || showChoices === true);

        const clearTopic = () => {
            this.getSearchQuery()["topic"] = "";
            setTopic("");
        }
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "column",
                height: this.getApp().isDesktop() ? 42 : hiDpiInputBoxBorderHeight,
                minWidth: "10em",
                maxWidth: "10em",
                overflow: "visible",
                // backgroundColor: "rgba(0,255,255,1)",
                // borderRadius: 20,
                border: "solid 1px rgba(0,0,0,0)",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                paddingLeft: 0,
                // paddingRight: 3,
                // marginRight: 14,
                // width: "12em",
                marginLeft: 0,
                marginTop: 15,
                marginBottom: 15,
                marginRight: 5,
                flex: this.getApp().isDesktop() ? 1 : "",
                boxSizing: "border-box",

            }}>
                <div style={{
                    display: "inline-flex",
                    flexDirection: "column",
                    minHeight: this.getApp().isDesktop() ? 40 : hiDpiInputBoxBorderHeight,
                    maxHeight: this.getApp().isDesktop() ? 40 : hiDpiInputBoxBorderHeight,
                    backgroundColor: "rgba(255,255,255,1)",
                    borderRadius: 20,
                    border: "solid 1px rgba(0,0,0,1)",
                    justifyContent: "space-around",
                    alignItems: "flex-start",
                    width: "100%",
                    paddingLeft: 15,
                    boxSizing: "border-box",
                    paddingRight: 3,
                    // marginRight: 15,
                    // width: "12em",
                    // marginLeft: 15 + 5,
                    // marginTop: 15,
                    // marginBottom: 15,
                    // marginRight: 5,
                    // position: "relative",
                    // backgroundColor: "blue",
                    // paddingLeft: 15,
                }}
                    onMouseDown={(event: any) => {
                        event.stopPropagation();
                        this.setShowCalendarStartTime(false);
                        this.setShowCalendarEndTime(false);
                        setShowChoices(!showChoices);
                    }}
                >
                    <div style={{
                        width: "100%",
                        // marginLeft: 15,
                        marginRight: 15,
                        display: "inline-flex",
                        justifyContent: showClearButton === true ? "space-between" : "flex-start",
                        alignItems: "center",
                        fontFamily: "Inter, sans-serif",
                        fontSize: this.getApp().isDesktop() ? 16 : "100%",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        flexDirection: "row",
                        // backgroundColor: "red",
                        // backgroundColor: "red",
                        // paddingLeft: 25,
                        color: this.getSearchQuery()["topic"] === "" ? "rgba(130, 130, 130, 1)" : "rgba(0,0,0,1)",
                    }}>
                        <div style={{ width: "80%", backgroundColor: "rgba(0,0,0,0)", overflow: "hidden" }}>
                            {this.getSearchQuery()["topic"] === "" ? "All topics" : this.getSearchQuery()["topic"]}
                        </div>

                        {showClearButton === false ? "" : <this._ElementClearButton onMouseDown={clearTopic}></this._ElementClearButton>}
                    </div>

                </div>

                {/* choices */}
                <div style={{
                    backgroundColor: "rgba(255,255,255,1)",
                    display: "inline-flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    minWidth: "6em",
                    // height: 40,
                    // backgroundColor: "rgba(255,255,255,1)",
                    borderRadius: 20,
                    border: "solid 2px rgba(0,0,0,1)",
                    justifyContent: "flex-start",
                    alignItems: "flex-start",
                    // paddingLeft: 15,
                    // paddingRight: 3,
                    padding: 15,
                    marginRight: 0,
                    marginTop: 15,
                    // width: "12em",
                    // marginLeft: 15 + 5,
                    // marginTop: 15,
                    marginBottom: 15,
                    visibility: showChoices === true ? "visible" : "hidden",
                    opacity: showChoices === true ? 1 : 0,
                    transition: "opacity 0.2s ease",

                }}
                    onMouseDown={() => {
                        setShowChoices(false);
                    }}
                >
                    {/* <this._ElementTopicChoice topic={""} setTopic={setTopic} setShowChoices={setShowChoices} ></this._ElementTopicChoice> */}
                    {allTopics.map((topic: string, index: number) => {
                        return (
                            <this._ElementTopicChoice topic={topic} setTopic={setTopic} setShowChoices={setShowChoices} ></this._ElementTopicChoice>
                        )
                    })}
                </div>
                {/* :
                    null
                } */}
            </div>
        )
    }


    _ElementTopicChoice = ({ topic, setTopic, setShowChoices }: { topic: string, setShowChoices: any, setTopic: any }) => {
        const elementRef = React.useRef<any>(null);
        // const [selected, setSelected] = React.useState(false);
        return (
            <div
                ref={elementRef}
                onMouseDown={(event: any) => {
                    event.stopPropagation();
                    setShowChoices(false);
                    setTopic(topic);
                    this.getSearchQuery()["topic"] = topic;
                }}
                onMouseEnter={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(235, 235, 235, 1)";
                        // elementRef.current.style["border"] = "solid 1px rgba(0,0,0,1)";
                    }
                }}
                onMouseLeave={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = this.getSearchQuery()["topic"] === topic ? "rgba(215,215,215, 1)" : "rgba(255, 255, 255, 1)";
                        // elementRef.current.style["border"] = "solid 1px rgba(0,0,0,0)";
                    }
                }}
                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: this.getSearchQuery()["topic"] === topic ? "rgba(215,215,215, 1)" : "rgba(255, 255, 255, 1)",
                    cursor: "pointer",
                    marginRight: 10,
                    borderRadius: 5,
                    border: "solid 1px rgba(0,0,0,1)",
                    transition: "background-color 0.2s ease",
                    marginTop: 5,
                    marginBottom: 5,
                    fontSize: this.getApp().isDesktop() ? 16 : "100%",
                }}
            >
                {topic === "" ? "All topics" : topic}
            </div>
        )
    }

    _ElementKeywords = () => {
        const navigate = useNavigate();
        const [, forceUpdate] = React.useState({});
        return (
            <form
                onSubmit={async (event: any) => {
                    event.preventDefault();

                    const confirmToGo = this.getApp().getThread().confirmRouteAway("Do you want to disgard the post?");
                    if (confirmToGo === false) {
                        return;
                    }
                    const searchQuery = this.getSearchQuery();
                    searchQuery["startingCount"] = 0;


                    const data = await doSearch(searchQuery);
                    this.getApp().setThreadsData(data.result);
                    this.getApp().setThreadsMatchCount(data["matchCount"]);
                    const url = convertSearchQueryToUrl(searchQuery);
                    navigate(url);
                }}
                style={{
                    marginRight: 0,
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
                        fontSize: this.getApp().isDesktop() ? 16 : "100%",
                        margin: 0,
                        fontFamily: "Inter, sans-serif",
                    }}
                    value={this.obtainKeywords()}
                    onChange={(event: any) => {
                        console.log("on change...", event.target.value)
                        if (event.target.value === "") {
                            this.getSearchQuery()["keywords"] = [];
                        } else {
                            this.getSearchQuery()["keywords"] = event.target.value.split(" ");
                        }
                        forceUpdate({});
                    }}
                    placeholder="Any title or text"
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
                    fontSize: this.getApp().isDesktop() ? 16 : "100%",
                    width: this.getApp().isDesktop() ? 34 : 80,
                    height: this.getApp().isDesktop() ? 34 : 80,
                    maxWidth: this.getApp().isDesktop() ? 34 : 80,
                    maxHeight: this.getApp().isDesktop() ? 34 : 80,
                    minWidth: this.getApp().isDesktop() ? 34 : 80,
                    minHeight: this.getApp().isDesktop() ? 34 : 80,
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
                    const confirmToGo = this.getApp().getThread().confirmRouteAway("Do you want to disgard the post?");
                    if (confirmToGo === false) {
                        return;
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


    _ElementClearButton = ({ onMouseDown }: any) => {

        const navigate = useNavigate();

        const elementRef = React.useRef<any>(null);
        return (
            <div
                ref={elementRef}
                style={{
                    // fontSize: 16,
                    width: 34,
                    height: 34,
                    maxWidth: this.getApp().isDesktop() ? 34 : 80,
                    maxHeight: this.getApp().isDesktop() ? 34 : 80,
                    minWidth: this.getApp().isDesktop() ? 34 : 80,
                    minHeight: this.getApp().isDesktop() ? 34 : 80,
                    borderRadius: 17,
                    display: "inline-flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(168, 196, 246, 0)",
                    cursor: "pointer",
                    transition: "background-color 0.2s ease",
                    color: "rgba(180, 180, 180, 1)",
                    fontSize: this.getApp().isDesktop() ? "100%" : 48,
                }}
                onMouseEnter={(event: any) => {
                    event.preventDefault();
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(168, 196, 246, 1)";
                        elementRef.current.style["color"] = "rgba(0, 0, 0, 1)";
                    }
                }}
                onMouseLeave={(event: any) => {
                    event.preventDefault();
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(168, 196, 246, 0)";
                        elementRef.current.style["color"] = "rgba(180, 180, 180, 1)";
                    }
                }}
                onMouseDown={(event: any) => {
                    event.stopPropagation();
                    onMouseDown();
                }}
                onClick={async (event: any) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
            >
                &#10005;
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

        const showClearButton = (showCalendar === false) && (isStartTime === true ? this.getSearchQuery()["timeRange"][0] !== 0 : this.getSearchQuery()["timeRange"][1] !== farFuture);

        const onMouseDownOnClearButton = () => {
            setShowCalendar(false);
            if (isStartTime) {
                // newDate.setHours(0, 0, 0, 0); // 00:00:00.000
                this.getSearchQuery().timeRange[0] = 0;
            } else {
                // newDate.setHours(23, 59, 59, 999); // 23:59:59.999
                this.getSearchQuery().timeRange[1] = farFuture;
            }
            forceUpdate({});
        }

        const [, forceUpdate] = React.useState({});

        return (
            <div
                style={{
                    position: "relative",
                    flex: this.getApp().isDesktop() ? 1 : "",
                    minWidth: this.getApp().isDesktop() ? "10em" : "25em",
                    maxWidth: this.getApp().isDesktop() ? "10em" : "25em",
                    marginRight: 5,
                    fontSize: 16,
                    // paddingLeft: 15,
                }}
            >
                <div style={{
                    height: this.getApp().isDesktop() ? 40 : hiDpiInputBoxBorderHeight,
                    border: "1px solid black",
                    borderRadius: 20,
                    width: "100%",
                    // marginLeft: 5,
                    // marginRight: 5,
                    cursor: "text",
                    position: "relative",
                    display: "inline-flex",
                    paddingLeft: 15,
                    boxSizing: "border-box",
                    justifyContent: "space-between",
                    alignItems: "center",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    fontSize: this.getApp().isDesktop() ? "100%" : hiDpiFontSizeScale,
                    paddingRight: 3,
                    color: isStartTime ? this.getSearchQuery().timeRange[0] === 0 ? "rgba(150, 150, 150, 1)" : "" : this.getSearchQuery().timeRange[1] === farFuture ? "rgba(150, 150, 150, 1)" : "",
                }}
                    onMouseDown={(event: any) => {
                        event?.stopPropagation();
                        this.setShowTopicChoices(false);
                        setShowCalendar(!showCalendar);
                        if (isStartTime) {
                            this.setShowCalendarEndTime(false);
                        } else {
                            this.setShowCalendarStartTime(false);
                        }

                    }}
                >
                    <div style={{ width: "80%", overflow: "hidden" }}>
                        {isStartTime ? this.getSearchQuery().timeRange[0] === 0 ? "From any time" : convertTime(this.getSearchQuery().timeRange[0]) : this.getSearchQuery().timeRange[1] === farFuture ? "To any time" : convertTime(this.getSearchQuery().timeRange[1])}
                    </div>
                    {showClearButton === true ? <this._ElementClearButton onMouseDown={onMouseDownOnClearButton}></this._ElementClearButton> : null}
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
        if (showCalendar === false) {
            return null
        }
        return (
            <div style={{
                position: "absolute",
                left: 10,
                top: 50,
                fontSize: 16,
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

                            // event?.stopPropagation();
                            setShowCalendar(!showCalendar);

                            if (isStartTime) {
                                this.setShowCalendarEndTime(false);
                            } else {
                                this.setShowCalendarStartTime(false);
                            }

                            //    forceUpdate({})
                        } else {
                            // should not happen
                        }

                    }}
                    value={this.obtainCalenderDate(isStartTime)}
                />
            </div>
        );
    }

    /**
     * Add new log, logout, and show search screen
     * 
     * the search screen is on different level
     */
    _ElementOnMobile = () => {
        const [, forceUpdate] = React.useState({});
        this.forceUpdate = forceUpdate;
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "column",
                fontFamily: "Inter, sans-serif",
                alignItems: "flex-start",
                marginLeft: 15,
                width: "80%",
                fontSize: this.getApp().isDesktop() ? "100%" : hiDpiFontSizeScale,
            }}>
                <div style={{
                    display: "inline-flex",
                    flexDirection: "row",
                    fontFamily: "Inter, sans-serif",
                    alignItems: "center",
                    marginLeft: 15,
                    flexWrap: "wrap",
                }}>

                    <this._ElementShowSearchScreenButton></this._ElementShowSearchScreenButton>
                    {this.getApp().getElementAddThreadButton()}
                    {this.getApp().getElementLogoutButton()}
                </div>

            </div>
        )
    }

    getElementSearchScreen = () => {
        return (<this._ElementSearchScreen></this._ElementSearchScreen>)
    }


    _ElementShowSearchScreenButton = () => {

        const elementRef = React.useRef<any>(null);
        const navigate = useNavigate();
        return (
            <div
                ref={elementRef}
                onClick={async () => {
                    // this.setShowSearchScreen(true);
                    navigate("/searchScreen")
                }}
                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: "rgba(235, 235, 235, 1)",
                    cursor: "pointer",
                    // marginRight: 200,
                    // marginLeft: 30,
                    marginRight: 10,
                    // height: 40,
                    borderRadius: 5,
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                    justifyContent: "center",
                    alignItems: "center",

                }}
            >
                {"Search"}
            </div>
        )
    }

    _ElementSearchScreen = () => {
        const [show, setShow] = React.useState(false);
        this.setShowSearchScreen = setShow;
        return (
            <div style={{
                // display: show ? "inline-flex" : "none",
                display: "inline-flex",
                flexDirection: "column",
                fontFamily: "Inter, sans-serif",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                flexWrap: "nowrap",
                fontSize: this.getApp().isDesktop() ? "100%" : hiDpiFontSizeScale,
                position: "absolute",
                left: 0,
                top: 0,
                // visibility: show ? "visible" : "none",
                // width: this.getApp().isDesktop() ? 0 : show? "100%" : 0,
                // height: this.getApp().isDesktop() ? 0 : show?  "100%": 0,
                width: "100%",
                height: "100%",
                backgroundColor: "white",
                // overflow: "invisible",
                zIndex: 10001,
                paddingLeft: "15%",
                paddingTop: "15%",
            }}>
                <this._ElementTime isStartTime={true}></this._ElementTime>
                <div style={{ height: "5%" }}></div>
                <this._ElementTime isStartTime={false}></this._ElementTime>
                <div style={{ height: "5%" }}></div>

                <this._ElementAuthor></this._ElementAuthor>
                <div style={{ height: "5%" }}></div>
                <this._ElementTopic></this._ElementTopic>
                <div style={{ height: "5%" }}></div>
                <div style={{
                    display: "inline-flex",
                    flexDirection: "row",
                    height: this.getApp().isDesktop() ? 40 : hiDpiInputBoxBorderHeight,
                    borderRadius: 20,
                    border: "solid 1px rgba(0,0,0,1)",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingLeft: this.getApp().isDesktop() ? 15 : 0,
                    paddingRight: 3,
                    marginLeft: 0,
                    marginRight: 15,
                    flex: "grow",
                    boxSizing: 'border-box',
                }}>
                    <this._ElementKeywords></this._ElementKeywords>
                    <this._ElementSearchButton></this._ElementSearchButton>
                </div>
            </div>
        )
    }




    _Element = () => {
        const [, forceUpdate] = React.useState({});
        this.forceUpdate = forceUpdate;
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "column",
                fontFamily: "Inter, sans-serif",
                alignItems: "flex-start",
                marginLeft: 15,
                width: "80%",
            }}>
                <div style={{
                    display: "inline-flex",
                    flexDirection: "row",
                    fontFamily: "Inter, sans-serif",
                    alignItems: "center",
                    marginLeft: 15,
                    flexWrap: "wrap",
                }}>
                    <div style={{
                        display: "inline-flex",
                        flexDirection: "row",
                        fontFamily: "Inter, sans-serif",
                        alignItems: "center",
                        flexWrap: "nowrap",
                    }}>
                        <this._ElementTime isStartTime={true}></this._ElementTime>
                        <this._ElementTime isStartTime={false}></this._ElementTime>

                        <this._ElementAuthor></this._ElementAuthor>
                        <this._ElementTopic></this._ElementTopic>
                    </div>
                    <div style={{
                        display: "inline-flex",
                        flexDirection: "row",
                        height: 40,
                        // backgroundColor: "rgba(255,255,0,1)",
                        borderRadius: 20,
                        border: "solid 1px rgba(0,0,0,1)",
                        justifyContent: "center",
                        alignItems: "center",
                        paddingLeft: 15,
                        paddingRight: 3,
                        marginLeft: 0,
                        marginRight: 15,
                        flex: "grow",
                        boxSizing: 'border-box',
                    }}>
                        <this._ElementKeywords></this._ElementKeywords>
                        <this._ElementSearchButton></this._ElementSearchButton>
                    </div>
                </div>
                {/* <div style={{
                    width: "100%",
                    display: "inline-flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 15,
                }}>
                </div> */}
            </div>
        )
    }



    getElement = () => {
        if (this.getApp().isDesktop()) {
            return <this._Element></this._Element>
        } else {
            return <this._ElementOnMobile></this._ElementOnMobile>
        }

    }


    getApp = () => {
        return this._app;
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

    obtainCalenderDate = (isStartTime: boolean) => {
        return isStartTime ? this.getSearchQuery().timeRange[0] === 0 ? new Date() : new Date(this.getSearchQuery().timeRange[0]) : this.getSearchQuery().timeRange[1] === farFuture ? new Date() : new Date(this.getSearchQuery().timeRange[1]);
    }

    obtainKeywords = () => {
        console.log("obtain keywords", this.getSearchQuery().keywords)
        return this.getSearchQuery().keywords.length === 0 ? "" : this.getSearchQuery().keywords.join(" ");
    }
}