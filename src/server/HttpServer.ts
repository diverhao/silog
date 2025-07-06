import express, { Request, Response } from 'express';
import path from 'path';


export class HttpServer {
    private _server = express();
    private _port: number;

    constructor(port: number) {
        this._port = port;
    }

    start = () => {
        this.getServer().use(express.static(path.join(__dirname, 'resources')));
        this.getServer().use(express.static(path.join(__dirname, '../webpack')));

        this.getServer().get('/', (req: Request, res: Response) => {
            res.send(path.join(__dirname, 'resources/index.html'))
        });

        this.getServer().get('/api/hello', (req, res) => {
            res.json({ message: 'Hello from Express!' });
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

}
