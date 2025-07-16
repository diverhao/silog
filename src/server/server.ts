import { DbData } from "./DbData";
import { HttpServer } from "./HttpServer";
import * as fs from "fs";

const configFilePath = process.argv[2];


const configFileBuf = fs.readFileSync(configFilePath, "utf-8");
const config = JSON.parse(configFileBuf);

const dbFile = config["db"]["file"];
const ldapOptions = config["ldap"];
const port = config["port"];
const keyFile = config["https"]["keyFile"];
const certFile = config["https"]["certFile"];

const dbData = new DbData(dbFile);
const httpServer = new HttpServer(port, dbData);

// set LDAP
httpServer.setLdapOptions({
    server: ldapOptions,
});

// set https
const httpsOptions = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
}
httpServer.setHttpsOptions(httpsOptions);

httpServer.start();


