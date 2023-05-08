import { useUser } from "@clerk/nextjs";
import { Message } from "@prisma/client";
import { api } from "~/utils/api";
import sendImage from "../assets/send.png";
import placeHolderProfileImage from "../assets/profile.png";
import Image from "next/image";
import { useRef } from "react";

const MessageView = (props: { otherUserId: string }) => {
    const { otherUserId } = props;
    const { user, isSignedIn } = useUser();
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
        const message = messageRef.current!.value;
        fetch("/api/sendNewMessage", {
            method: "POST",
            body: JSON.stringify({
                senderId: user.id,
                receiverId: otherUserId,
                content: message,
                file: null
            })
        }).then((res) => res.status)
            .then((status) => {
                if (status === 200) {
                    return;
                }
            }).finally(() => {
                return;
            });
    }

    const UniqueMessage = (props: { data: Message, type: MessageType, name: string }) => {
        const { data, type, name } = props;

        if (type === MessageType.sent) {
            return (
                <div className="flex flex-col ml-auto border-2 border-black bg-green-600 text-white p-4 rounded">
                    <div className="flex flex-row gap-1">
                        <Image src={placeHolderProfileImage} alt={`profile picture for ${name}`} height={20} width={20} />
                        <p className="text-sm text-gray-900">{name}</p>
                    </div>
                    <p className="text-xl">{data.content}</p>
                </div>
            )
        }
        return (
            <div className="flex flex-col mr-auto border-2 border-black bg-gray-600 text-white p-4 rounded">
                <div className="flex flex-row gap-1">
                    <Image src={placeHolderProfileImage} alt={`profile picture for ${name}`} height={20} width={20} />
                    <p className="text-sm text-gray-300">{name}</p>
                </div>
                <p className="text-xl">{data.content}</p>
            </div>
        )
    }

    if (!isFetched || !currentUserFetched || !otherUserFetched) {
        return <div>Loading</div>
    }
    // at this point everything is fetched
    return (
        <div className="flex flex-col h-full w-full">
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
            </div>
            <div className="flex flex-row w-full border-t-2 border-white gap-1">
                <input type="text" placeholder="Message..." className="w-full focus:outline-none bg-transparent text-white text-2xl px-2" ref={messageRef} />
                <button onClick={sendMessage}><Image alt="send message" src={sendImage} height="50" width="50"></Image></button>
            </div>
        </div>
    )
}

export default MessageView;