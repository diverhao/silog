import express, { Request, Response } from 'express';
import path from 'path';
import { DbData, type_search_query } from './DbData';
import * as fs from "fs";
import https from "https";

import passport from "passport";
import LdapStrategy from "passport-ldapauth";
import session from "express-session";

export class HttpServer {
    private _server = express();
    private _dbData: DbData;
    private _port: number;
    private _httpsOptions: { key: Buffer, cert: Buffer } | undefined = undefined;
    private _httpsServer: https.Server | undefined = undefined;

    constructor(port: number, dbData: DbData) {
        this._port = port;
        this._dbData = dbData;
    }

    LDAP_OPTIONS: LdapStrategy.Options = {
        server: {
            url: "ldap://localhost:3890",
            bindDN: "",
            bindCredentials: "",
            searchBase: "ou=users,dc=example,dc=com",
            searchFilter: "(uid={{username}})",
            searchScope: "sub",
            tlsOptions: { rejectUnauthorized: false },
        },
    };

    start = () => {


        // ------------ LDAP authentication ------------------------

        // tell passport.js to use LDAP authentication strategy
        passport.use(new LdapStrategy(this.LDAP_OPTIONS));
        passport.serializeUser((user, done) => done(null, user));
        passport.deserializeUser((user: any, done) => done(null, user));

        // passport.js and session
        // express-session midware, passport.js depends on it
        this._server.use(session({
            secret: "secretKey",
            resave: false,
            saveUninitialized: true
        }));
        // init passport.js
        this._server.use(passport.initialize());
        // add .user, .isAuthenticated(), to req
        this._server.use(passport.session());



        // ---------------- midwares -------------------------------
        this.getServer().use("/resources", express.static(path.join(__dirname, 'resources')));
        this.getServer().use(express.static(path.join(__dirname, '../webpack')));
        this.getServer().use(express.json({ limit: "50mb" })); // required to parse JSON body
        this._server.use(express.urlencoded({ limit: 10 * 1024 * 1024, extended: true }));


        // authentication
        this._server.use((req: any, res: any, next: any) => {
            if (req.path === '/' || req.path === '/login' || req.path.startsWith("/resources/")) {
                next();
                return;
            }

            if (req.isAuthenticated()) {
                next(); // Proceed to the requested route if authenticated
                return
            } else {
                res.status(403).send("Access Denied. Please <a href='/login'>log in</a>.");
                return;
            }
        });

        this._server.post('/login',
            // authentication midware
            (req: any, res: any, next: any) => {
                const ldapMidware = passport.authenticate("ldapauth", { session: true });
                ldapMidware(req, res, next);
                return;
            },
        );

        this._server.post("/me", (req, res) => {
            if (req.isAuthenticated()) {
                console.log(req.user)
                const userInfo = req.user as any;
                res.json({
                    // username: req.user.uid, // Or whatever attribute your LDAP returns
                    displayName: userInfo.displayName,
                });
            } else {
                res.status(401).json({ error: "Not logged in" });
            }

        })

        this._server.post('/logout', (req, res) => {
            req.logout((err) => {
                if (err) {
                    console.error("Logout error:", err);
                    return res.status(500).send("Logout failed.");
                }

                req.session.destroy(() => {
                    res.clearCookie("connect.sid"); // optional: clear the session cookie
                    res.sendStatus(200); // or res.json({ success: true })
                });
            });
        });

        this.getServer().get('/login', (req: Request, res: Response) => {
            res.sendFile(path.join(__dirname, 'resources/login.html'))
        });

        this.getServer().get('/', (req: Request, res: Response) => {
            res.redirect("/login")
        });

        this.getServer().get('/main', (req: Request, res: Response) => {
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

            res.json({ url: `/resources/${fileName}` });
        });


        // this.getServer().all("/{*any}", (req, res) => {
        //     // console.log("AAABBB")
        //     res.sendFile(path.join(__dirname, 'resources/index.html'))
        // })

        // this.getServer().listen(this.getPort(), () => {
        //     console.log(`Server running at http://localhost:${this.getPort()}`);
        // });

        const httpsOptions = this.getHttpsOptions();
        if (httpsOptions === undefined) {
            return;
        }
        // listen to all network interfaces
        this._httpsServer = https.createServer(httpsOptions, this.getServer()).listen(this.getPort(), "0.0.0.0", () => {
            console.log(`HTTPS Server running on port ${this.getPort()}`);
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

    getHttpsOptions = () => {
        return this._httpsOptions;
    }

    setHttpsOptions = (newOptions: { key: Buffer, cert: Buffer } ) => {
        this._httpsOptions = newOptions;
    }

    setLdapOptions = (newOptions: LdapStrategy.Options) => {
        this.LDAP_OPTIONS = newOptions;
    }

}
