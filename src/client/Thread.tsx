import React, { Children, useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { allTopics, App, type_post, type_thread, type_topic } from "./App";

import "../server/resources/tiptap_style.scss";

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
// import { useEditor } from '@tiptap/react';
import { useEditor, Editor, EditorContent } from '@tiptap/react';
// import Table from '@tiptap/extension-table'
// import TableRow from '@tiptap/extension-table-row'
// import TableCell from '@tiptap/extension-table-cell'
// import TableHeader from '@tiptap/extension-table-header'
import { TableCell, TableKit } from '@tiptap/extension-table'

// import Table from '@tiptap/extension-table'
// import TableRow from '@tiptap/extension-table-row'
// import TableCell from '@tiptap/extension-table-cell'
// import TableHeader from '@tiptap/extension-table-header'

// import Figure from '@tiptap/extension-figure';
import Image from '@tiptap/extension-image';
import { ImageResize } from './ImageResize';
import { convertSearchQueryToUrl, getTimeStr } from './Shared';
// import { useBlocker } from 'react-router-dom';

const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: null,
                parseHTML: element => element.getAttribute('width'),
                renderHTML: attributes => {
                    if (!attributes.width) return {};
                    return { width: attributes.width };
                },
            },
            height: {
                default: null,
                parseHTML: element => element.getAttribute('height'),
                renderHTML: attributes => {
                    if (!attributes.height) return {};
                    return { height: attributes.height };
                },
            },
        };
    },
});

const _ElementEditorButton = ({ children, disabled, className, onClick }: any) => {
    const elementRef = React.useRef<any>(null);
    return <button
        ref={elementRef}
        style={{
            marginRight: 5,
            border: "solid 1px rgba(200, 200, 200, 1)",
            borderRadius: 2,
            transition: "background-color 0.2s ease",
            backgroundColor: "rgba(235, 235, 235, 1)",
        }}
        onClick={onClick}
        onMouseEnter={() => {
            if (elementRef.current !== null) {
                elementRef.current.style["backgroundColor"] = "rgba(215, 215, 215, 1)";
            }
        }}
        onMouseLeave={() => {
            if (elementRef.current !== null) {
                elementRef.current.style["backgroundColor"] = "rgba(235, 235, 235, 1)";
            }
        }}
        disabled={disabled}
        className={className}
    >
        {children}
    </button>
}

const MenuBar = ({ editor }: any) => {
    // const { editor } = useCurrentEditor()

    if (!editor) {
        return null
    }

    return (
        <div className="control-group">
            <div style={{
                marginBottom: 5,
            }}>

                <_ElementEditorButton
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*'; // Only allow image files
                        input.onchange = () => {
                            const file = input.files?.[0];
                            if (!file) return;

                            const reader = new FileReader();

                            reader.onload = () => {
                                const src = reader.result as string;
                                editor
                                    .chain()
                                    .focus()
                                    .insertContent({
                                        type: 'image',
                                        attrs: {
                                            src: src,
                                            style: 'width: 300px; height: auto;',
                                        },
                                    })
                                    .run();

                                // You can now use the base64 string (e.g., insert it into <img>, send to server, etc.)
                            };

                            reader.readAsDataURL(file); // Read file as Base64
                        };
                        input.click();

                    }}
                >
                    Insert Figure
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    }
                    className={editor.isActive('bold') ? 'is-active' : ''}
                >
                    Bold
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleRe().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleBold()
                            .run()
                    }
                    className={editor.isActive('bold') ? 'is-active' : ''}
                >
                    Regular
                </_ElementEditorButton>

                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleItalic()
                            .run()
                    }
                    className={editor.isActive('italic') ? 'is-active' : ''}
                >
                    Italic
                </_ElementEditorButton>

                {/* <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleStrike()
                            .run()
                    }
                    className={editor.isActive('strike') ? 'is-active' : ''}
                >
                    Strike
                </_ElementEditorButton> */}
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .toggleCode()
                            .run()
                    }
                    className={editor.isActive('code') ? 'is-active' : ''}
                >
                    Code
                </_ElementEditorButton>


                {/* <_ElementEditorButton onClick={() => editor.chain().focus().unsetAllMarks().run()}>
                    Clear marks
                </_ElementEditorButton>
                <_ElementEditorButton onClick={() => editor.chain().focus().clearNodes().run()}>
                    Clear nodes
                </_ElementEditorButton> */}
                {/* <_ElementEditorButton
                    onClick={() => editor.chain().focus().setParagraph().run()}
                    className={editor.isActive('paragraph') ? 'is-active' : ''}
                >
                    Paragraph
                </_ElementEditorButton> */}
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                >
                    Large font
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                >
                    Medium font
                </_ElementEditorButton>
                {/* <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                >
                    H3
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
                    className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
                >
                    H4
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
                    className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
                >
                    H5
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
                    className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
                >
                    H6
                </_ElementEditorButton> */}
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                >
                    Bullet list
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'is-active' : ''}
                >
                    Ordered list
                </_ElementEditorButton>
                {/* <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                    className={editor.isActive('codeBlock') ? 'is-active' : ''}
                >
                    Code block
                </_ElementEditorButton> */}
                {/* <_ElementEditorButton
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'is-active' : ''}
                >
                    Blockquote
                </_ElementEditorButton> */}
                {/* <_ElementEditorButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                    Horizontal rule
                </_ElementEditorButton> */}
                {/* <_ElementEditorButton onClick={() => editor.chain().focus().setHardBreak().run()}>
                    Hard break
                </_ElementEditorButton> */}
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .undo()
                            .run()
                    }
                >
                    Undo
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={
                        !editor.can()
                            .chain()
                            .focus()
                            .redo()
                            .run()
                    }
                >
                    Redo
                </_ElementEditorButton>
                {/* <_ElementEditorButton
                    onClick={() => editor.chain().focus().setColor('#958DF1').run()}
                    className={editor.isActive('textStyle', { color: '#958DF1' }) ? 'is-active' : ''}
                >
                    Purple
                </_ElementEditorButton> */}

                {/* Table */}
            </div>
            <div className='button-group'>
                <_ElementEditorButton onClick={() => {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                }}>
                    Insert table
                </_ElementEditorButton>

                <_ElementEditorButton
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    disabled={!editor.can().addColumnBefore()}
                >
                    Add column before
                </_ElementEditorButton>
                <_ElementEditorButton
                    onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>
                    Add column after
                </_ElementEditorButton>
                <_ElementEditorButton onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>
                    Delete column
                </_ElementEditorButton>
                <_ElementEditorButton onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>
                    Add row before
                </_ElementEditorButton>
                <_ElementEditorButton onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>
                    Add row after
                </_ElementEditorButton>
                <_ElementEditorButton onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>
                    Delete row
                </_ElementEditorButton>
            </div>
        </div >
    )
}



export class Thread {
    _threadData: type_thread = [];
    _threadId: string = "";
    _state: "view" | "adding-post" | "adding-thread" = "view";
    _editor: Editor | null = null;
    _app: App;

    constructor(app: App) {
        this._app = app;
        window.addEventListener('beforeunload', (event: any) => {
            if (this.getState() !== "view") {
                event.preventDefault();
            }
        });
    }


    _ElementThread = () => {
        const [, forceUpdate] = React.useState({});

        const location = useLocation();

        const params = new URLSearchParams(location.search)
        const threadId = params.get('id');
        const state = params.get("state");


        React.useEffect(() => {

            if (this.getState() === "adding-thread") {
                // thread ID is changed. However, we don't want to fetch because there is 
                // no such data on server
                return;
            }

            if (threadId === null) {
                return;
            }


            // const threadId = this.getThreadId();
            fetch("/thread", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ threadId: threadId }),
            })
                .then(
                    (res) => {
                        return res.json()
                    }
                ).then(data => {
                    this.setThreadData(threadId, data.result);
                    forceUpdate({});
                })
        }, [threadId, state])

        const threadData = this.getThreadData();
        if (threadData === undefined) {
            return <div>thread empty</div>;
        }
        const mainPostData = threadData[0];

        if (mainPostData === undefined) {
            // new thread
            return (
                <div style={{
                    paddingLeft: 50,
                    paddingRight: 50,
                    // backgroundColor: "green",
                    width: "90%",

                }}>
                    <this._ElementNewPost />
                </div>
            )
        }

        return (
            <div style={{
                paddingLeft: 50,
                paddingRight: 50,
                // backgroundColor: "green",
                width: "90%",

            }}>

                {threadData.map((postData: type_post, index: number) => {
                    if (this.getState() === "adding-thread") {
                        return null;
                    } else {
                        return (
                            <this._ElementPost postData={postData} index={index}></this._ElementPost>
                        )
                    }
                })}

                {/* shown in "adding-post" */}
                <this._ElementNewPost />
            </div>
        )
    }

    _ElementPost = ({ postData, index }: { postData: type_post, index: number }) => {
        const threadData = this.getThreadData();
        if (threadData === undefined) {
            return null;
        }

        return (
            <div>
                <this._ElementPostTitle postData={postData} index={index}></this._ElementPostTitle>
                <this._ElementPostTopics postData={postData} index={index}></this._ElementPostTopics>
                <this._ElementPostAuthorTime postData={postData} index={index}></this._ElementPostAuthorTime>
                <this._ElementPostText postData={postData} index={index}></this._ElementPostText>
                <hr></hr>
            </div>
        )
    }


    _ElementPostTitle = ({ postData, index }: { postData: type_post, index: number }) => {
        const title = postData["title"];
        if (index > 0) {
            return null;
        } else {
            return (
                <div style={{
                    fontSize: 28,
                    marginBottom: 15,
                }}>
                    {title}
                </div>
            )
        }
    }

    _ElementPostTopics = ({ postData, index }: { postData: type_post, index: number }) => {
        if (index > 0) {
            return null;
        }
        const topics = postData["topics"];
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "row",

            }}>
                {topics.map((topic: string, index: number) => {
                    return (
                        <this._ElementPostTopic key={topic + `${index}`} topic={topic}></this._ElementPostTopic>
                    )
                })}
            </div>
        )
    }


    _ElementNewPostTopics = ({ topics, setTopics }: { topics: type_topic[], setTopics: any }) => {
        const elementRef = React.useRef<any>(null);
        return (
            <div style={{
                display: "inline-flex",
                flexDirection: "row",
                marginBottom: 20,
            }}
            >
                {allTopics.map((topic: string, index: number) => {
                    return (
                        <this._ElementNewPostTopic key={topic + `${index}`} topic={topic} setTopics={setTopics}></this._ElementNewPostTopic>
                    )
                })}
            </div>
        )
    }

    _ElementNewPostTopic = ({ topic, setTopics }: { topic: string, setTopics: any }) => {
        const elementRef = React.useRef<any>(null);
        const [selected, setSelected] = React.useState(false);
        return (
            <div
                ref={elementRef}
                onClick={() => {
                    if (selected) {
                        // will be un-selected
                        setTopics((oldTopics: any) => {
                            return oldTopics.filter((item: any) => item !== topic);
                        })
                    } else {
                        setTopics((oldTopics: any) => {
                            return [...new Set([...oldTopics, topic])];
                        })

                    }
                    setSelected(!selected);
                }}
                onMouseEnter={() => {
                    if (selected === true) {
                        return;
                    }
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(215,215,215,1)";
                    }
                }}

                onMouseLeave={() => {
                    if (selected === true) {
                        return;
                    }
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(235,235,235,1)";
                    }
                }}

                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: selected ? "rgba(235, 235, 235, 1)" : "rgba(235, 235, 235, 1)",
                    color: selected ? "rgba(0,0,0, 1)": "rgba(173, 173, 173, 1)",
                    cursor: "pointer",
                    marginRight: 10,
                    borderRadius: 5,
                    transition: "background-color 0.2s ease",
                }}
            >
                {topic}
            </div>
        )
    }

    _ElementPostTopic = ({ topic }: { topic: string }) => {
        const elementRef = React.useRef<any>(null);
        const navigate = useNavigate();
        return (
            <div
                ref={elementRef}
                onClick={() => {
                    const confirmToGo = this.confirmRouteAway("Do you want to disgard the post?");
                    if (confirmToGo === false) {
                        return;
                    }
                    const searchQuery = this.getApp().getSearchBar().getSearchQuery();
                    searchQuery["topic"] = topic;
                    const url = convertSearchQueryToUrl(searchQuery);
                    navigate(url)

                }}
                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: "rgba(235, 235, 235, 1)",
                    cursor: "pointer",
                    marginRight: 10,
                    borderRadius: 5,
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(220, 220, 220, 1)";
                    }
                }}

                onMouseLeave={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(235, 235, 235, 1)";
                    }
                }}
            >
                {topic}
            </div>
        )
    }

    _ElementPostAuthorTime = ({ postData, index }: { postData: type_post, index: number }) => {
        const author = postData["author"];
        const time = postData["time"];
        return (
            <div style={{
                marginBottom: 15,
                marginTop: 15,
            }}>
                By <span
                    onClick={() => {
                        // todo: search this author's all posts
                    }}
                > {author} </span> at {getTimeStr(time)}
            </div>
        )
    }

    _ElementPostText = ({ postData, index }: { postData: type_post, index: number }) => {
        const text = postData["text"];
        return (
            <div dangerouslySetInnerHTML={{ __html: text }} />
        )
    }


    _ElementPublishPostButton = ({ text, setText, editor, title, topics }: { text: string, setText: any, editor: Editor, title: string, topics: type_topic[] }) => {
        const navigate = useNavigate();
        const elementRef = React.useRef<any>(null);

        return (
            <div
                ref={elementRef}
                onClick={async () => {
                    // stop if the topics and title are there
                    if (this.getState() === "adding-thread") {
                        if (topics.length === 0) {
                            // show error message
                            this.getApp().fullPageMessageText = "You must select at least one topic.";
                            this.getApp().setFullPageMessageType("error");
                            return;
                        }
                        if (title.trim().length === 0) {
                            // show error message
                            this.getApp().fullPageMessageText = "The title is empty.";
                            this.getApp().setFullPageMessageType("error");
                            return;
                        }
                    }
                    if (this.getState() === "adding-post") {
                        if (text.trim() === "") {
                            // show error message
                            this.getApp().fullPageMessageText = "There is no content in this post.";
                            this.getApp().setFullPageMessageType("error");
                            return;
                        }
                    }


                    const confirmed = window.confirm("Do you want to publish the post?");
                    if (confirmed === false) {
                        return;
                    }
                    const oldState = this.getState();
                    this.setState("view");
                    // write to server
                    const cleanText = await this.replaceBase64WithUrls(text);


                    const postData: type_post = {
                        title: oldState === "adding-thread" ? title : "",
                        author: "",
                        time: 0,
                        text: cleanText,
                        topics: oldState === "adding-thread" ? topics : [],
                    };

                    const response = await fetch(oldState === "adding-post" ? "/follow-up-post" : "/new-thread", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ threadId: this.getThreadId(), postData: postData }),
                    });
                    const data = await response.json();
                    const result = data["result"];
                    const threadId = data["threadId"];

                    navigate(`/thread?id=${threadId}`);
                }}
                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: "rgba(235, 235, 235, 1)",
                    cursor: "pointer",
                    marginRight: 10,
                    borderRadius: 5,
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(220, 220, 220, 1)";
                    }
                }}

                onMouseLeave={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(235, 235, 235, 1)";
                    }
                }}
            >
                {"Post"}
            </div>
        )
    }


    _ElementCancelPostButton = ({ setText, editor }: { setText: any, editor: Editor }) => {
        const navigate = useNavigate();
        const elementRef = React.useRef<any>(null);
        return (
            <div
                ref={elementRef}
                onClick={async () => {
                    const confirmed = window.confirm("Do you want to cancel this post?");
                    if (confirmed === false) {
                        return;
                    }
                    setText("");
                    editor.commands.setContent("");
                    if (this.getState() === "adding-post") {
                        this.setState("view");
                        const url = `/thread?id=${this.getThreadId()}`;
                        navigate(url)
                    } else if (this.getState() === "adding-thread") {
                        this.setState("view");
                        const url = `/`;
                        navigate(url)
                    }
                }}

                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: "rgba(235, 235, 235, 1)",
                    cursor: "pointer",
                    marginRight: 10,
                    borderRadius: 5,
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(220, 220, 220, 1)";
                    }
                }}

                onMouseLeave={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(235, 235, 235, 1)";
                    }
                }}
            >
                {"Cancel"}
            </div>
        )
    }

    _ElementAddPostButton = () => {
        const navigate = useNavigate();
        const elementRef = React.useRef<any>(null);
        return (
            <div
                ref={elementRef}
                className='no-print'
                onClick={async () => {
                    this.setState("adding-post");
                    const url = `/thread?id=${this.getThreadId()}&state=adding-post`;
                    navigate(url)
                }}
                style={{
                    display: "inline-flex",
                    padding: 5,
                    paddingLeft: 10,
                    paddingRight: 10,
                    backgroundColor: "rgba(235, 235, 235, 1)",
                    cursor: "pointer",
                    marginRight: 10,
                    borderRadius: 5,
                    transition: "background-color 0.2s ease",
                }}
                onMouseEnter={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(220, 220, 220, 1)";
                    }
                }}

                onMouseLeave={() => {
                    if (elementRef.current !== null) {
                        elementRef.current.style["backgroundColor"] = "rgba(235, 235, 235, 1)";
                    }
                }}
            >
                {"Add Follow Up Post"}
            </div>
        )
    }

    _ElementNewThreadTitle = ({ title, setTitle }: { title: string, setTitle: any }) => {

        return (
            <form
                style={{
                    width: "100%",
                }}
                onSubmit={(event: any) => { event.preventDefault() }}>
                <input
                    style={{
                        fontSize: 28,
                        outline: "none",
                        padding: 15,
                        paddingTop: 8,
                        paddingBottom: 8,
                        // border: "none",
                        marginBottom: 20,
                        fontFamily: "Inter, sans-serif",
                        border: "solid 1px rgba(180, 180, 180, 1)",
                        borderRadius: 26,
                        width: "100%",
                        boxSizing: "border-box",
                    }}
                    spellCheck={false}
                    placeholder='Title'
                    value={title}
                    onChange={(event: any) => {
                        setTitle(event.target.value);
                    }}
                >
                </input>
            </form>
        )
    }


    _ElementNewPost = () => {
        const [text, setText] = useState('');
        const [title, setTitle] = useState("");
        const [topics, setTopics] = useState<type_topic[]>([]);

        const editor = useEditor({
            extensions: [
                StarterKit,
                ImageResize,
                CustomImage,
                TableKit.configure({
                    table: { resizable: true },
                    tableCell: false,
                }),
                TableCell,
            ],
            content: "",
            onUpdate({ editor }) {
                console.log(editor.getHTML())
                setText(editor.getHTML());
            },
        });

        if (!editor) {
            return <p>Loading editor...</p>;
        }
        this._editor = editor;

        useEffect(() => {
            if (!editor) return;
            // drop down image
            const handleDrop = (event: DragEvent) => {
                event.preventDefault();

                const files = event.dataTransfer?.files;
                if (!files || files.length === 0) return;

                const file = files[0];
                if (!file.type.startsWith('image/')) return;

                const reader = new FileReader();
                reader.onload = () => {
                    const src = reader.result as string;

                    editor
                        .chain()
                        .focus()
                        .insertContent({
                            type: 'image',
                            attrs: {
                                src: src,
                                style: 'width: 300px; height: auto;',
                            },
                        })
                        .run();
                };
                reader.readAsDataURL(file);
            };

            // paste image
            const handlePaste = (event: ClipboardEvent) => {
                const items = event.clipboardData?.items;
                if (!items) return;

                for (const item of items) {
                    if (item.type.startsWith('image/')) {
                        event.preventDefault(); // prevent default paste behavior

                        const file = item.getAsFile();
                        if (!file) return;

                        const reader = new FileReader();

                        reader.onload = () => {
                            const src = reader.result as string;

                            editor
                                .chain()
                                .focus()
                                .insertContent({
                                    type: 'image',
                                    attrs: {
                                        src: src,
                                        style: 'width: 300px; height: auto;',
                                    },
                                })
                                .run();
                        };

                        reader.readAsDataURL(file);
                        break; // stop after first image
                    }
                }
            };

            const dom = editor.view.dom;
            dom.addEventListener('drop', handleDrop);
            dom.addEventListener('paste', handlePaste);

            return () => {
                dom.removeEventListener('paste', handlePaste);
                dom.removeEventListener('drop', handleDrop);
            };
        }, [editor]);

        if (this.getState() === "adding-post" || this.getState() === "adding-thread") {

            return (
                <div style={{
                    marginBottom: 100,
                }}>
                    {this.getState() === "adding-thread" ? <this._ElementNewThreadTitle title={title} setTitle={setTitle}></this._ElementNewThreadTitle> : null}
                    {this.getState() === "adding-thread" ? <this._ElementNewPostTopics topics={topics} setTopics={setTopics}></this._ElementNewPostTopics> : null}

                    <MenuBar editor={editor}></MenuBar>

                    <EditorContent editor={editor} className="my-editor" />
                    <div style={{
                        display: "inline-flex",
                        flexDirection: "row",
                    }}>
                        {/* Post button */}
                        <this._ElementPublishPostButton text={text} setText={setText} editor={editor} title={title} topics={topics}></this._ElementPublishPostButton>
                        <this._ElementCancelPostButton setText={setText} editor={editor}></this._ElementCancelPostButton>
                    </div>
                </div>
            );
        } else {
            return (
                <div style={{
                    marginBottom: 100,
                }}>
                    <this._ElementAddPostButton></this._ElementAddPostButton>
                </div>
            )
        }

    }




    extractBase64Images = (html: string) => {
        const imgRegex = /<img[^>]+src="(data:image\/[^"]+)"[^>]*>/g;
        const matches: string[] = [];
        let match;

        while ((match = imgRegex.exec(html)) !== null) {
            matches.push(match[1]); // the base64 string
        }

        return matches;
    }

    uploadBase64Image = async (base64: string): Promise<string> => {
        const res = await fetch('/upload-image', {
            method: 'POST',
            body: JSON.stringify({ image: base64 }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) throw new Error('Upload failed');

        const data = await res.json();
        return data.url; // e.g., https://yourcdn.com/uploaded.jpg
    }

    replaceBase64WithUrls = async (html: string): Promise<string> => {
        const base64s = this.extractBase64Images(html);

        for (const base64 of base64s) {
            const url = await this.uploadBase64Image(base64);
            html = html.replace(base64, url);
        }

        // for Table appearance
        html = '<div class="tiptap">' + html + "</div>";

        return html;
    }

    getThreadData = () => {
        return this._threadData;
    }

    setThreadData = (newId: string, newData: type_thread) => {
        this._threadId = newId;
        this._threadData = newData;
    }

    getThreadId = () => {
        return this._threadId;
    }

    getElement = () => {
        return <this._ElementThread></this._ElementThread>
    }

    getState = () => {
        return this._state;
    }



    setState = (newState: "view" | "adding-post" | "adding-thread") => {
        this._state = newState;
    }

    getEditor = () => {
        return this._editor;
    }

    getApp = () => {
        return this._app;
    }

    confirmRouteAway = (message: string) => {
        if (this.getState() === "adding-post" || this.getState() === "adding-thread") {
            const confirmed = window.confirm(message);
            if (confirmed === false) {
                // stop 
            } else {
                // continue
                this.setState("view");
            }
            return confirmed;
        } else {
            // continue
            return true;
        }
    }

}