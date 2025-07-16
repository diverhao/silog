import { DbData } from "./DbData";
import { HttpServer } from "./HttpServer";
import * as fs from "fs";

const dbData = new DbData("/Users/haohao/tlog/src/server/test/test01.json");
const httpServer = new HttpServer(4000, dbData);

// set LDAP
httpServer.setLdapOptions({
    server: {
        url: "ldap://localhost:3890",
        bindDN: "",
        bindCredentials: "",
        searchBase: "ou=users,dc=example,dc=com",
        searchFilter: "(uid={{username}})",
        searchScope: "sub",
        tlsOptions: { rejectUnauthorized: false },
    },
});

// set https
const keyFile = "/Users/haohao/tlog/server.key";
const certFile = "/Users/haohao/tlog/server.cert";
const httpsOptions = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
}
httpServer.setHttpsOptions(httpsOptions);

httpServer.start();


