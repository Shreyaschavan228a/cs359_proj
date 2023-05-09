import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { api } from "~/utils/api";
import type { User } from "@prisma/client";
import Link from "next/link";

const UpdatePage = () => {
    const { user, isSignedIn, isLoaded } = useUser();
    const [username, setUserName] = useState("");
    const [profileUrl, setProfileUrl] = useState("");
    const [success, setSuccess] = useState("");
    useEffect(() => {
        if (isSignedIn) {
            console.log(user.id);
        }
    }, [isSignedIn])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSignedIn) {
            if (user.id === "" || username === "") {
                setSuccess("no");
                setTimeout(() => {
                    setSuccess("")
                }, 2000);
                return;
            }
            fetch("/api/updateUser", {
                method: "POST",
                body: JSON.stringify({ username, profileUrl, userId: user.id })
            }).then((res) => {
                return res.status;
            }).then((status) => {
                if (status === 200) {
                    setSuccess("yes");
                    setTimeout(() => {
                        setSuccess("")
                    }, 2000);
                }
                else if (status === 400) {
                    setSuccess("no");
                    setTimeout(() => {
                        setSuccess("")
                    }, 2000);
                }
                else {
                    console.log("Unreachable");
                }
            }).finally(() => {
                return;
            })
        }
    }

    if (!isLoaded) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center text-3xl text-gray-400">
                <p>Loading</p>
            </div>
        )
    }
    return (
        <div className="h-full w-full">
            {
                isSignedIn && isLoaded &&
                <div className="flex flex-col justify-center items-center p-2 py-4 h-2/4 gap-8">
                    <h1 className="text-3xl">Update your profile</h1>
                    <form onSubmit={handleSubmit} className="flex flex-col w-fit border-white border-2 rounded p-3">
                        <label htmlFor="name">Name:</label>
                        <input id="name" placeholder="Name..." onBlur={(e) => { setUserName(e.target.value) }} className="bg-transparent border-blue-900 border-2 text-white outline-none" type="text" />
                        <label htmlFor="profileImage">Profile Image Url:</label>
                        <input id="profileImage" placeholder="Url..." onBlur={(e) => setProfileUrl(e.target.value)} className="bg-transparent border-blue-900 border-2 text-white outline-none" type="text" />
                        <button type="submit">Submit</button>
                    </form>
                    {
                        success === "no" &&
                        <div className="border-2 border-red-600 p-3">
                            <p>Something went wrong</p>
                        </div>
                    }
                    {
                        success === "yes" &&
                        <div className="border-2 border-green-500 p-3">
                            <p>Profile updated successfully</p>
                        </div>
                    }
                </div>
            }
            {
                (!isSignedIn || !isLoaded) &&
                <div className="h-full w-full flex flex-col items-center justify-center text-3xl text-gray-400">
                    <p>Not Signed in</p>
                    <Link href=".." className="underline">Home</Link>
                </div>
            }
        </div>

    )
}
export default UpdatePage;