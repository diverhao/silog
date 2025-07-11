import React, { Children, useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { type_post, type_thread } from "./App";

import "../server/resources/tiptap_style.scss";

import { Color } from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import { EditorProvider, useCurrentEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
// import { useEditor } from '@tiptap/react';
import { useEditor, Editor, EditorContent } from '@tiptap/react';

import Figure from 'tiptap-extension-figure';
import Image from '@tiptap/extension-image';
import { ImageResize } from './ImageResize';
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
    return <button
        style={{
            marginRight: 5,
        }}
        onClick={onClick}
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
            <div className="button-group">

                <_ElementEditorButton
                    onClick={() => {
                        console.log("trying to insert a fig")
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*'; // Only allow image files
                        console.log("step  2")
                        input.onchange = () => {
                            console.log("step  3")
                            const file = input.files?.[0];
                            if (!file) return;

                            const reader = new FileReader();

                            reader.onload = () => {
                                const src = reader.result as string;
                                console.log("Base64 string:", src);
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
            </div>
        </div>
    )
}



export class Thread {
    _threadData: type_thread | undefined = undefined;
    _threadId: string = "";
    _state: "view" | "adding-post" = "view";
    _editor: Editor | null = null;

    constructor() {
        window.addEventListener('beforeunload', (event: any) => {
            if (this.getState() !== "view") {
                event.preventDefault();
            }
        });
    }


    _ElementThread = () => {

        const threadData = this.getThreadData();
        console.log(threadData)
        if (threadData === undefined) {
            return <div>thread empty</div>;
        }
        const mainPostData = threadData[0];
        const title = mainPostData["title"];
        const author = mainPostData["author"];
        const time = mainPostData["time"];
        const text = mainPostData["text"];
        const topics = mainPostData["topics"];

        return (
            <div style={{
                paddingLeft: 50,
                paddingRight: 50,
                // backgroundColor: "green",
                width: "90%",

            }}>

                {threadData.map((postData: type_post, index: number) => {
                    return (
                        <this._ElementPost postData={postData} index={index}></this._ElementPost>
                    )
                })}
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

    _ElementPostTopic = ({ topic }: { topic: string }) => {
        const elementRef = React.useRef<any>(null);
        return (
            <div
                ref={elementRef}
                onClick={() => {
                    // todo
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
                > {author} </span> at {new Date(time).toISOString()}
            </div>
        )
    }

    _ElementPostText = ({ postData, index }: { postData: type_post, index: number }) => {
        const text = postData["text"];
        return (
            <div dangerouslySetInnerHTML={{ __html: text }} />
        )
    }


    _ElementPublishPostButton = ({ text, setText, editor }: { text: string, setText: any, editor: Editor }) => {
        const navigate = useNavigate();
        const elementRef = React.useRef<any>(null);

        return (
            <div
                ref={elementRef}
                onClick={async () => {

                    const confirmed = window.confirm("Do you want to publish the post?");
                    if (confirmed === false) {
                        return;
                    }


                    this.setState("view");
                    // write to server
                    const cleanText = await this.replaceBase64WithUrls(text);


                    const postData: type_post = {
                        title: "",
                        author: "",
                        time: 0,
                        keywords: [],
                        text: cleanText,
                        topics: [],
                        attachments: [],
                    };

                    const response = await fetch("/follow-up-post", {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ threadId: this.getThreadId(), postData: postData }),
                    });
                    const data = await response.json();
                    const result = data["result"];
                    if (result === true) {
                        console.log("step 2")
                        // refresh page
                        fetch("/thread", {
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ threadId: this.getThreadId() }),
                        })
                            .then(
                                (res) => {
                                    console.log("step 3")
                                    return res.json()
                                }
                            ).then(data => {
                                setText("");
                                editor.commands.setContent("");
                                this.setThreadData(this.getThreadId(), data.result);
                                const url = `/thread?${new URLSearchParams({ id: this.getThreadId() })}`;
                                navigate(url);
                            })

                    } else {
                        // todo:
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
                    this.setState("view");
                    const url = `/thread?id=${this.getThreadId()}`;
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
                onClick={async () => {
                    // this.setState("adding-post");
                    // in transition, waiting for approval
                    this.setState("adding-post");
                    const url = `/thread?id=${this.getThreadId()}`;
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


    _ElementNewPost = () => {
        const [text, setText] = useState('<p>Hello World</p>');

        const editor = useEditor({
            extensions: [StarterKit, Image, Figure, ImageResize, CustomImage],
            content: "",
            onUpdate({ editor }) {
                setText(editor.getHTML());
            },
        });

        if (!editor) {
            return <p>Loading editor...</p>;
        }
        this._editor = editor;

        useEffect(() => {
            if (!editor) return;

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

            const dom = editor.view.dom;
            dom.addEventListener('drop', handleDrop);

            return () => {
                dom.removeEventListener('drop', handleDrop);
            };
        }, [editor]);


        if (this.getState() === "adding-post") {

            return (
                <div style={{
                    marginBottom: 100,
                }}>
                    <MenuBar editor={editor}></MenuBar>

                    <EditorContent editor={editor} className="my-editor" />
                    <div style={{
                        display: "inline-flex",
                        flexDirection: "row",
                    }}>
                        {/* Post button */}
                        <this._ElementPublishPostButton text={text} setText={setText} editor={editor}></this._ElementPublishPostButton>
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

    // isAddingPost = () => {
    //     return this._addingPost;
    // }

    // setIsAddingPost = (newState: boolean) => {
    //     this._addingPost = newState;
    // }

    // setIsPublisingPost = (newState: boolean) => {
    //     this._publishingPost = newState;
    // }

    // isPublishingPost = () => {
    //     return this._publishingPost;
    // }

    getState = () => {
        return this._state;
    }



    setState = (newState: "view" | "adding-post") => {
        this._state = newState;
    }

    getEditor = () => {
        return this._editor;
    }

}