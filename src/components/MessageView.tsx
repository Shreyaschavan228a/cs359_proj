/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useUser } from "@clerk/nextjs";
import type { Message } from "@prisma/client";
import { api } from "~/utils/api";
import sendImage from "../assets/send.png";
import placeHolderProfileImage from "../assets/profile.png";
import attatchmentImage from "../assets/attatchment.png"
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "~/server/uploadthing";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

const MessageView = (props: { otherUserId: string }) => {
    const { otherUserId } = props;
    const { user, isSignedIn } = useUser();
    const [uploadThingVisible, showUploadThing] = useState(false);
    const [fileUrl, setFileUrl] = useState("");
    // for handling messages that were sent or received during this specific lifetime of the component
    const [messageData, setMessageData] = useState<Message[]>([]);
    const messageRef = useRef<HTMLInputElement>(null);
    if (!isSignedIn) {
        return <div className="text-red h-full w-full">
            <p>Something went wrong</p>
        </div>
    }
    const { data: messages, isFetched } = api.messages.getUniqueMessages.useQuery({ currentUserId: user.id, otherUserId });
    const { data: currentUser, isFetched: currentUserFetched } = api.users.getUniqueUser.useQuery({ userId: user.id });
    const { data: otherUser, isFetched: otherUserFetched } = api.users.getUniqueUser.useQuery({ userId: otherUserId });

    enum MessageType {
        sent,
        received
    }

    const sendMessage = () => {
        const content = messageRef.current!.value;
        const message = {
            senderId: user.id,
            receiverId: otherUserId,
            content,
            file: fileUrl
        } as Message;
        fetch("/api/sendNewMessage", {
            method: "POST",
            body: JSON.stringify(message)
        }).then((res) => res.status)
            .then((status) => {
                if (status === 200) {
                    return;
                }
            }).finally(() => {
                messageRef.current!.value = "";
                setFileUrl("");
                setMessageData([...messageData, message]);
                return;
            });
    }

    const SingleFileUploader = () => {
        const { getRootProps, getInputProps, isDragActive, files, startUpload } =
            useUploadThing("imageUploader");

        const handleUpload = () => {
            startUpload()
                //@ts-ignore
                .then((fileData: [{ fileUrl: string }]) => {
                    const url = fileData[0].fileUrl;
                    setFileUrl(url);
                })
                .finally(() => {
                    showUploadThing(false);
                });
        }
        return (
            <div className="h-120 w-2/3 absolute bg-black flex flex-col p-4">
                <button onClick={() => { showUploadThing(false); setFileUrl(""); }} className="ml-auto">Hide</button>
                <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <div>
                        {files.length > 0 && (
                            <button onClick={handleUpload}>
                                Upload {files.length} files
                            </button>
                        )}
                    </div>
                    Drop files here!
                </div>
            </div>
        )
    }

    const UniqueMessage = (props: { data: Message, type: MessageType, name: string }) => {
        const { data, type, name } = props;
        const [fileUrl, setFileUrl] = useState("");

        const getFileName = (file: string) => {
            return file.split('/').pop() ?? "blob";
        }

        // weird hack for download because link spec doesnt allow cross-origin downloads
        // TODO: find some way to make downloadable links that dont 
        // doesnt do anything for now
        const getFileUrl = () => {
            if (!data.file) {
                return;
            }
        }
        if (type === MessageType.sent) {
            return (
                <div className="flex flex-col ml-auto border-2 border-black bg-green-600 text-white p-4 rounded">
                    <div className="flex flex-row gap-1">
                        <Image src={placeHolderProfileImage} alt={`profile picture for ${name}`} height={20} width={20} />
                        <p className="text-sm text-gray-900">{name}</p>
                    </div>
                    <p className="text-xl">{data.content}</p>
                    {
                        data.file &&
                        <div className="flex flex-col text-gray-800">
                            <p>Attatched File:</p>
                            <Link href={data.file} target="_blank">Download</Link>
                        </div>
                    }
                </div>
            )
        }
        else {
            return (
                <div className="flex flex-col mr-auto border-2 border-black bg-gray-600 text-white p-4 rounded">
                    <div className="flex flex-row gap-1">
                        <Image src={placeHolderProfileImage} alt={`profile picture for ${name}`} height={20} width={20} />
                        <p className="text-sm text-gray-300">{name}</p>
                    </div>
                    <p className="text-xl">{data.content}</p>
                    {
                        data.file &&
                        <div className="flex flex-col text-gray-800">
                            <p>Attatched File:</p>
                            <Link href={data.file} target="_blank">Download</Link>
                        </div>
                    }
                </div>
            )
        }

    }

    if (!isFetched || !currentUserFetched || !otherUserFetched) {
        return <div>Loading</div>
    }
    // at this point everything is fetched
    return (
        <div className="flex flex-col h-full w-full relative justify-center items-center">
            {
                uploadThingVisible &&
                <SingleFileUploader />
            }
            {
                !uploadThingVisible &&
                <>
                    <div className="grow w-full flex flex-col p-4">
                        {
                            isFetched && messages?.map((message, index) => {
                                if (message.senderId === user.id) {
                                    // very bad not null assertion but have to do it. no time left for proper error catching
                                    return <UniqueMessage data={message} type={MessageType.sent} name={currentUser!.username!} key={index} />
                                } else {
                                    return <UniqueMessage data={message} type={MessageType.received} name={otherUser!.username!} key={index} />
                                }
                            })
                        }
                        {/* only for rendering new messages in this runtime, on next mount they will be rendered by the block above */}
                        {/* probably have some better way of doing this */}
                        {
                            messageData?.map((message, index) => {
                                if (message.senderId === user.id) {
                                    // very bad not null assertion but have to do it. no time left for proper error catching
                                    return <UniqueMessage data={message} type={MessageType.sent} name={currentUser!.username!} key={index} />
                                } else {
                                    return <UniqueMessage data={message} type={MessageType.received} name={otherUser!.username!} key={index} />
                                }
                            })
                        }
                    </div>
                    <div className="flex flex-row w-full border-t-2 border-white gap-1">
                        <input type="text" placeholder="Message..." className="w-full focus:outline-none bg-transparent text-white text-2xl px-2" ref={messageRef} />
                        <button onClick={() => { showUploadThing(true) }}><Image src={attatchmentImage} alt="attatch a file" height="50" width="50" /></button>
                        <button onClick={sendMessage}><Image alt="send message" src={sendImage} height="50" width="50"></Image></button>
                    </div>
                </>
            }
        </div>
    )
}

export default MessageView;