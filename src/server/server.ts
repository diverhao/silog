import { HttpServer } from "./HttpServer";

const httpServer = new HttpServer(4000);
httpServer.start();