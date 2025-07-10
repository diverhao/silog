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
        this.getServer().use(express.json()); // required to parse JSON body

        this.getServer().get('/', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'resources/index.html'))
        });

        this.getServer().get('/search', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'resources/index.html'))
        });
        
        this.getServer().get('/thread', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'resources/index.html'))
        });

        this.getServer().post('/search', (req, res) => {

            let searchQuery: type_search_query = req.body;
            searchQuery = {
                timeRange: searchQuery["timeRange"], // || [0, Date.now()],
                authors: searchQuery["authors"] || [],
                keywords: searchQuery["keywords"] || [],
                topics: searchQuery["topics"] || [],
                startingCount: searchQuery["startingCount"] || 0,
                count: searchQuery["count"] || 50,
            };

            const searchResult = this.getDbData().searchThreads(searchQuery);

            res.json({
                query: searchQuery,
                result: searchResult,
            });
        });


        this.getServer().post('/thread', (req, res) => {

            let searchQuery = req.body;
            console.log("search Query raw", searchQuery)
            const threadId = searchQuery["threadId"];

            const searchResult = this.getDbData().getThread(threadId);

            res.json({
                threadId: threadId,
                result: searchResult,
            });
        });


        this.getServer().post('/follow-up-post', (req, res) => {
            let {postData, threadId} = req.body;
            const result = this.getDbData().addFollowUpPost(postData, threadId);
            // const searchResult = this.getDbData().getThread(threadId);

            res.json({
                threadId: threadId,
                result: result, // true or false
            });

        })

        // this.getServer().all("/{*any}", (req, res) => {
        //     // console.log("AAABBB")
        //     res.sendFile(path.join(__dirname, 'resources/index.html'))
        // })

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
