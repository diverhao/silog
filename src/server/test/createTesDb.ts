import { DbData, type_post } from "../DbData";
import { LoremIpsum } from "lorem-ipsum";

// create test json
const dbData = new DbData("/Users/1h7/projects/tlog/src/server/test/test01.json");

// generate a post
const genratePost = () => {
    const loremTitle = new LoremIpsum({
        sentencesPerParagraph: {
            max: 1,
            min: 1,
        },
        wordsPerSentence: {
            max: 16,
            min: 4,
        },
    });
    const loremAuthor = new LoremIpsum({
        sentencesPerParagraph: {
            max: 1,
            min: 1,
        },
        wordsPerSentence: {
            max: 4,
            min: 2,
        },
    });

    const loremText = new LoremIpsum({
        sentencesPerParagraph: {
            max: 5,
            min: 1,
        },
        wordsPerSentence: {
            max: 16,
            min: 4,
        },
    });
    const loremTopics = new LoremIpsum({
        words: ["control", "operation", "cryo", "magnet", "physics"], // 👈 your custom list
        random: Math.random, // default random generator

        sentencesPerParagraph: {
            max: 1,
            min: 1,
        },
        wordsPerSentence: {
            max: 3,
            min: 1,
        },
    });

    const loremAttachment = new LoremIpsum({
        sentencesPerParagraph: {
            max: 1,
            min: 1,
        },
        wordsPerSentence: {
            max: 4,
            min: 0,
        },
    });

    const post: type_post = {
        title: loremTitle.generateSentences(1).replaceAll(".", ""),
        author: loremAuthor.generateSentences(1).replaceAll(".", ""),
        time: generateTime(), // ms since epoch, time of post
        // keywords: loremKeywords.generateSentences(1).split(" "),
        text: loremText.generateParagraphs(2),
        topics: loremTopics.generateSentences(1).replaceAll(".", "").toLowerCase().split(" ") as any,
        // attachments: loremAttachment.generateSentences(1).split(" "),
    }
    return post;
}

const generateTime = () => {
    const tEnd = 1751812254000;
    const tStart = tEnd - 100000000000;
    return Math.floor(tStart + Math.random() * 100000000000);
}

// 20 threads per day, 2 posts per thread
// 10 years
for (let ii = 0; ii < 20 * 365 * 10/10; ii++) {
    const threadId = dbData.addThread(genratePost());
    for (let jj = 0; jj < 1; jj++) {
        dbData.addFollowUpPost(genratePost(), threadId);
    }
}

dbData.saveDb()

// -------------- search thread ------------
// const searchResult = dbData.searchThreads({
//     timeRange: [0, 3751813306000], // time range
//     author: "", // match author, if [], match any author
//     keywords: [], // match title and text, if [], match any text
//     topic: "control", // match topics, e.g. cryo, magnet, operation, if [], match any topic
//     startingCount: 0, // from which match should I return, e.g. 0, or 50
//     count: 50, // number of matches we want for this query, e.g. 50
// })
// console.log(Object.keys(searchResult).length)
