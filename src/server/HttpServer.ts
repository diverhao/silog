import express, { Request, Response } from 'express';
import path from 'path';
import { DbData, type_search_query } from './DbData';
import * as fs from "fs";

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
        this.getServer().use(express.json({limit: "50mb"})); // required to parse JSON body

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
                timeRange: searchQuery["timeRange"], // must come with a time range
                author: searchQuery["author"] || "",
                keywords: searchQuery["keywords"] || [],
                topic: searchQuery["topic"] || "",
                startingCount: searchQuery["startingCount"] || 0,
                count: searchQuery["count"] || 50,
            };

            const searchResult = this.getDbData().searchThreads(searchQuery);
            

            res.json({
                query: searchQuery,
                result: searchResult["result"],
                matchCount: searchResult["matchCount"],
            });
        });


        this.getServer().post('/thread', (req, res) => {

            let searchQuery = req.body;
            console.log("search Query raw", searchQuery)
            const threadId = searchQuery["threadId"];

            const searchResult = this.getDbData().searchThread(threadId);

            res.json({
                threadId: threadId,
                result: searchResult,
            });
        });


        this.getServer().post('/follow-up-post', (req, res) => {
            let { postData, threadId } = req.body;
            const result = this.getDbData().addFollowUpPost(postData, threadId);
            // const searchResult = this.getDbData().getThread(threadId);

            res.json({
                threadId: threadId,
                result: result, // true or false
            });
        })


        this.getServer().post('/new-thread', (req, res) => {
            let { postData, threadId } = req.body;
            const newThreadId = this.getDbData().addThread(postData);
            // const searchResult = this.getDbData().getThread(threadId);

            res.json({
                threadId: newThreadId,
                result: true, // true or false
            });
        })

        this.getServer().post('/upload-image', async (req, res) => {
            const { image } = req.body;
            console.log("upload image", image)

            const buffer = Buffer.from(image.split(',')[1], 'base64');
            const fileName = `upload-${Date.now()}.png`;

            fs.writeFileSync(path.join(__dirname, `./resources/${fileName}`), buffer);

            res.json({ url: `/${fileName}` });
        });


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
