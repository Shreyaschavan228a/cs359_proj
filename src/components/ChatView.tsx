import { SetStateAction, useState, useRef } from "react";
import type { User } from "@prisma/client";
import { api } from "~/utils/api";
import Image from "next/image";
import placholderImage from "../assets/profile.png";
import type { responseType } from "~/pages/api/createNewChat";
import { toast } from "react-toastify";

const ChatItem = (props: { userId: string }) => {
    const { data: user, isLoading } = api.users.getUniqueUser.useQuery({ userId: props.userId });
    return (

        <div>
            {
                !user && <div>Loading Chat...</div>
            }
            {
                user &&
                <div className="border-b border-slate-300 flex flex-ro2 bg-gradient-to-r from-slate-800 to-slate-900 px-4 font-bold py-2 gap-2 items-center">
                    <div>
                        <Image src={user.profileImage === "" ? placholderImage : user.profileImage} alt="profile-image" width="40" height="40" />
                    </div>
                    <div className="flex flex-col">
                        <p className="text-2xl">{user.username}</p>
                    </div>
                </div>
            }

        </div >
    )
}

const ChatView = (props: { userId: string, setChat: React.Dispatch<SetStateAction<string>> }) => {
    const { userId, setChat } = props;
    const { data: userChats, isLoading } = api.users.getUserChats.useQuery({ userId });
    const newChatRef = useRef<HTMLInputElement>(null);

    const handleNewChat = () => {
        const newUserName = newChatRef.current!.value;
        fetch('/api/createNewChat', {
            method: "POST",
            body: JSON.stringify({ currentUserId: userId, newUserName: newUserName }),
        })
            .then(async (res) => {
                return res.json();
            })
            .then((jsonObj: responseType) => {
                const { secondUserId, error } = jsonObj;

                if (error === "None" || error === "Chat already exists") {
                    setChat(secondUserId!);
                }
                else if (error === "User not found") {
                    toast.error(error, {
                        position: "top-center",
                        autoClose: 1500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "dark",
                    });
                }
                newChatRef.current!.value = "";
            })
            .finally(() => {
                console.log("done");
            });
    }

    return (
        <>
            {
                isLoading && <div>Loading Data...</div>
            }
            {
                <div className="bg-slate-900 border-red-600 border-r-2 h-full flex flex-col">

                    <div className="flex flex-row text-2xl border-b-2 p-4 items-stretch w-full justify-between">
                        <input type="text" ref={newChatRef} className="focus:outline-none bg-transparent text-white text-2xl px-2"
                            placeholder="Create new chat..."
                        />
                        <button onClick={handleNewChat}><span className="material-icons">add</span></button>
                    </div>

                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 grow">
                        {
                            userChats?.map((e, i) => {
                                let other_user_id: string;
                                if (e.user_one_id == userId) {
                                    other_user_id = e.user_two_id;
                                }
                                else {
                                    other_user_id = e.user_one_id;
                                }
                                return (
                                    <div key={i} onClick={() => setChat(other_user_id)}>
                                        <ChatItem userId={other_user_id} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            }
        </>

    )
}

export default ChatView;