import { DbData } from "./DbData";
import { HttpServer } from "./HttpServer";

const dbData = new DbData("/Users/1h7/projects/tlog/src/server/test/test01.json");
const httpServer = new HttpServer(4000, dbData);
httpServer.start();


