import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Outlet, Link } from 'react-router-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SearchBar } from './SearchBar';


export type type_search_query = {
    timeRange: [number, number], // time range
    authors: string[], // match author, if [], match any author
    keywords: string[], // match title and text, if [], match any text
    topics: string[], // match topics, e.g. cryo, magnet, operation, if [], match any topic
    startingCount: number, // from which match should I return, e.g. 0, or 50
    count: number, // number of matches we want for this query, e.g. 50
}

export class App {

    // keywordsStr = "";
    // authorsStr = "";
    topicsStr = "";
    _searchBar: SearchBar;
    constructor() {
        this._searchBar = new SearchBar(this);
    }
    // _ElementSearch = () => {
    //     return (
    //         <div style={{
    //             display: "inline-flex",
    //             flexDirection: "row",

    //         }}>
    //             {/* todo: time range */}
    //             <this._ElementSearchKeywordsStr></this._ElementSearchKeywordsStr>
    //             <this._ElementSearchAuthorsStr></this._ElementSearchAuthorsStr>
    //         </div>
    //     )
    // }



    _Element = () => {
        const [message, setMessage] = useState('');

        // return (
        //     <BrowserRouter>
        //         <Routes>
        //             <Route path="/" element={<this.Layout />}>
        //                 <Route path="home" element={<this.Home />} />
        //                 <Route path="about" element={<this.About />} />
        //                 {/* Add more pages here */}
        //             </Route>
        //         </Routes>
        //     </BrowserRouter>
        // );



        return (
            <div>
                <this._ElementTopBar></this._ElementTopBar>
            </div>
        );
    }

    // router independent
    // search bar
    _ElementTopBar = () => {
        return (
            <div style={{
                width: "100%",
                height: 100,
                paddingLeft: 50,
                display: "inline-flex",
                alignItems: "center",
                // justifyContent: "center",
            }}>
                <img src="/logo.png" style={{
                    width: 200,
                }}></img>
                {this.getSearchBar().getElement()}
            </div>
        )
    }

    // Layout = () => {
    //     return (
    //         <div className="app-layout">
    //             <header>
    //                 <nav style={{fontSize: 22}}>
    //                     <Link to="/home">Home</Link>
    //                     <Link to="/about">About</Link>
    //                 </nav>
    //             </header>
    //             <main>
    //                 <Outlet /> {/* This is where the active area content goes */}
    //             </main>
    //         </div>
    //     );
    // }

    // Home = () => {
    //     return(<div>
    //         aaa bbb
    //         <Link to="/about">go to about</Link>
    //     </div>)
    // }

    // About = () => {
    //     return(<div>
    //         !!!About
    //     </div>)
    // }


    getElement = () => {
        return <this._Element></this._Element>
    }

    getSearchBar = () => {
        return this._searchBar;
    }
}

const app = new App();

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(app.getElement());
