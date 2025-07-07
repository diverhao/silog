import express, { Request, Response } from 'express';
import path from 'path';
import { DbData, type_search_query } from './DbData';


export class HttpServer {
    private _server = express();
    private _dbData: DbData;
    private _port: number;

    constructor(port: number, dbData: DbData) {
        this._port = port;
        this._dbData = dbData;
    }

    start = () => {
        this.getServer().use(express.static(path.join(__dirname, 'resources')));
        this.getServer().use(express.static(path.join(__dirname, '../webpack')));

        this.getServer().get('/', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'resources/index.html'))
        });


        this.getServer().get('/home', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'resources/index.html'))
        });


        this.getServer().get('/search', (req, res) => {
            const query = req.query;
            // convert the GET query to type_search_query
            // ?timeRange=123+456&authors=John+doe&keywords=key+words&topics=cryo+control&startintCount=100&count=50
            // all of them are optional

            // time range, [number, number]
            const timeRangeStr = query.timeRange;
            const timeRange: [number, number] = [0, Date.now()];
            if (typeof timeRangeStr === "string") {
                const timeRangeStrArray = timeRangeStr.split(" ");
                if (timeRangeStrArray.length === 2) {
                    const tStart = parseInt(timeRangeStrArray[0]);
                    const tEnd = parseInt(timeRangeStrArray[1]);
                    if (!isNaN(tStart) && !isNaN(tEnd)) {
                        timeRange[0] = Math.min(tStart, tEnd);
                        timeRange[1] = Math.max(tStart, tEnd);
                    }
                }
            }

            // authors, string[]
            const authorsStr = query.authors;
            let authors: string[] = [];
            if (typeof authorsStr === "string") {
                authors = authorsStr.split(" ");
            }

            // keywords, string[]
            const keywordsStr = query.keywords;
            let keywords: string[] = [];
            if (typeof keywordsStr === "string") {
                keywords = keywordsStr.split(" ");
            }

            // topics, string[]
            const topicsStr = query.topics;
            let topics: string[] = [];
            if (typeof topicsStr === "string") {
                topics = topicsStr.split(" ");
            }


            // staringCount, number
            const startingCountStr = query.startingCount;
            let startingCount: number = 0;
            if (typeof startingCountStr === "string") {
                const tmp = parseInt(startingCountStr);
                if (!isNaN(tmp)) {
                    startingCount = tmp;
                }
            }

            // count, number
            const countStr = query.count;
            let count: number = 50;
            if (typeof countStr === "string") {
                const tmp = parseInt(countStr);
                if (!isNaN(tmp)) {
                    count = tmp;
                }
            }

            const searchQuery: type_search_query = {
                timeRange: timeRange,
                authors: authors,
                keywords: keywords,
                topics: topics,
                startingCount: startingCount,
                count: count,
            };

            const searchResult = this.getDbData().searchThreads(searchQuery);

            res.json({
                query: searchQuery,
                result: searchResult,
            });
        });


        this.getServer().listen(this.getPort(), () => {
            console.log(`Server running at http://localhost:${this.getPort()}`);
        });

    }

    // -------------------- getters -------------------------

    getServer = () => {
        return this._server;
    }

    getPort = () => {
        return this._port;
    }

    getDbData = () => {
        return this._dbData;
    }

}
