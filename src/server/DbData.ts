import * as fs from "fs";
import { v4 as uuid } from "uuid";

/**
 * systems in the facility
 */
export type type_topic = "control" | "operation" | "cryo" | "magnet" | "physics";

/**
 * type of one post, a post could be 
 */
export type type_post = {
    title: string,
    author: string,
    time: number, // ms since epoch, time of post
    keywords: string[],
    // id: string, // uuid
    // subId: number, // 0 means it is the first post in a thread, 1 means the first follow-up post in a thread
    text: string,
    topics: type_topic[], // could be multiple system, vacuum, cryo, admin, control, magnet, ...
    attachments: string[], // any type file, e.g. pic, txt, others, located in the month folder
}

/**
 * Each thread is a collection of posts, there is one main post, rests are follow-ups
 */
export type type_thread = type_post[];

/**
 * Thread ID vs thread data
 */
export type type_month = Record<string, type_thread>;

/**
 * All the data: month vs type_threads_month
 */
export type type_db = Record<string, type_month>;

export type type_search_query = {
    timeRange: [number, number], // time range
    authors: string[], // match author, if [], match any author
    keywords: string[], // match title and text, if [], match any text
    topics: string[], // match topics, e.g. cryo, magnet, operation, if [], match any topic
    startingCount: number, // from which match should I return, e.g. 0, or 50
    count: number, // number of matches we want for this query, e.g. 50
}

export class DbData {
    private readonly _dbFilePath: string;
    private _db: type_db = {};
    constructor(dbFilePath: string) {
        this._dbFilePath = dbFilePath;
        this.readDbFile();
    }

    readDbFile = () => {
        const buf = fs.readFileSync(this.getDbFilePath(), "utf-8");
        this._db = JSON.parse(buf);
    }


    // never delete a post/thread
    // automatically create month entry

    /**
     * AND
     */
    searchThreads = (searchQuery: type_search_query) => {
        const t0 = performance.now();
        const result: Record<string, type_thread> = {};
        const tStart = searchQuery["timeRange"][0];
        const tEnd = searchQuery["timeRange"][1];
        let matchCount = 0;
        // each search should not have more than 100 results
        if (searchQuery["count"] > 100) {
            searchQuery["count"] = 100;
        }

        // go over all months
        for (const [monthStr, month] of Object.entries(this.getDb())) {
            const [monthStartTime, monthEndTime] = this.getMonthTimeRange(monthStr);
            // this month is out of time range
            // console.log(monthStartTime, tStart, tEnd, monthStr)
            if (monthStartTime > tEnd || monthEndTime < tStart) {
                continue;
            }

            for (const [threadId, thread] of Object.entries(month)) {
                let threadMatched: boolean = false;
                for (const post of thread) {
                    const postTime = post["time"];
                    const postAuthor = post["author"];
                    const postText = post["text"];
                    const postTitle = post["title"];
                    const postTopics = post["topics"];
                    let timeMatched = false;
                    let authorsMatched = false;
                    let keywordsMatched = false;
                    let topicsMatched = false;

                    // match time
                    if (postTime > tStart && postTime < tEnd) {
                        timeMatched = true;
                    }

                    // match author, OR
                    if (searchQuery["authors"].length === 0) {
                        authorsMatched = true;
                    } else if (searchQuery["authors"].includes(postAuthor)) {
                        authorsMatched = true;
                    }

                    // match topics, AND
                    if (searchQuery["topics"].length === 0) {
                        topicsMatched = true;
                    } else {
                        topicsMatched = true;
                        for (const topic of searchQuery["topics"]) {
                            if (!postTopics.includes(topic as any)) {
                                topicsMatched = false;
                                break;
                            }
                        }
                    }

                    // match keywords, AND
                    if (searchQuery["keywords"].length === 0) {
                        keywordsMatched = true;
                    } else {
                        keywordsMatched = true;
                        for (const keyword of searchQuery["keywords"]) {
                            if (!postTitle.includes(keyword) && !postText.includes(keyword)) {
                                keywordsMatched = false;
                                break;
                            }
                        }
                    }

                    // console.log(timeMatched, authorsMatched, keywordsMatched, topicsMatched)

                    // this Post matches, no need to further search
                    if (timeMatched && authorsMatched && keywordsMatched && topicsMatched) {
                        threadMatched = true;
                        break;
                    }

                }

                if (threadMatched) {
                    // console.log("aaa", matchCount)
                    if (matchCount >= searchQuery["startingCount"] && matchCount < searchQuery["startingCount"] + searchQuery["count"]) {
                        result[threadId] = thread;
                    }
                    matchCount++;
                    if (matchCount >= searchQuery["startingCount"] + searchQuery["count"]) {
                        break;
                    }
                }
            }
        }
        const t1 = performance.now();
        // print search summary
        console.log("Search query:", JSON.stringify(searchQuery, null, 4));
        console.log("Found", Object.keys(result).length, "result,", "takes", Math.round(t1 - t0), "ms");
        return result;
    }

    getMonthTimeRange = (monthStr: string): [number, number] => {
        const start = new Date(`${monthStr}-01T00:00:00.000Z`).getTime();
        const [year, month] = monthStr.split('-').map(Number);
        const end = new Date(Date.UTC(year, month, 1) - 1).getTime();
        return [start, end];
    }

    addThread = (newPost: type_post) => {
        // don't trust the timestamp from client
        const time = Date.now();
        let month = this.getMonthFromTime(time);
        if (month === undefined) {
            // add new month
            const monthStr = this.getMonthStrFromTime(time);
            month = this.addNewMonth(monthStr);
        }
        newPost.time = time;
        const newThread: type_thread = [newPost];
        const newThreadId = uuid();
        month[newThreadId] = newThread;
        console.log("new thread", newThread)
        return newThreadId;
    }

    addFollowUpPost = (newFollowUpPost: type_post, threadId: string) => {
        // find the main post object
        console.log("add follow up post:", newFollowUpPost);
        const thread = this.getThread(threadId);
        if (thread === undefined) {
            // todo: 
            console.log("Thread", threadId, "not found");
            return false;
        } else {
            // modify its time
            newFollowUpPost["time"] = Date.now();
            thread.push(newFollowUpPost);
            return true;
        }
    }


    private addNewMonth = (newMonthStr: string) => {
        const newMonth: type_month = {};
        this.getDb()[newMonthStr] = newMonth;
        return newMonth;
    }

    saveDb = () => {
        try {
            fs.writeFileSync(this.getDbFilePath(), JSON.stringify(this.getDb(), null, 4));
        } catch (e) {
            console.log("[Error] Failed to write database file to", this.getDb());
        }
    }

    backupDb = () => {
        const backupFileName = this.getDbFilePath().replace(".json", `-${Date.now()}` + ".json");
        try {
            fs.copyFileSync(this.getDbFilePath(), backupFileName)
        } catch (e) {
            console.log("[Error] Failed to backup database file to", backupFileName);
        }
    }



    // ---------------- getters ---------------------



    getDbFilePath = () => {
        return this._dbFilePath;
    }

    getDb = () => {
        return this._db;
    }

    getMonthFromTime = (time: number) => {
        const monthStr = this.getMonthStrFromTime(time);
        return this.getMonth(monthStr);
    }

    getMonthStrFromTime = (time: number) => {
        const date = new Date(time);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    getMonth = (monthStr: string): type_month | undefined => {
        return this.getDb()[monthStr];
    }

    getThread = (threadId: string) => {
        for (const [, month] of Object.entries(this.getDb())) {
            const thread = month[threadId];
            if (thread !== undefined) {
                return thread;
            }
        }
        return undefined;
    }

}