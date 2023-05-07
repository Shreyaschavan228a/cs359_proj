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
    const [sucess, setSuccess] = useState("");
    useEffect(() => {
        if (isSignedIn) {
            console.log(user.id);
        }
    }, [isSignedIn])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSignedIn) {
            fetch("/api/updateUser", {
                method: "POST",
                body: JSON.stringify({ username, profileUrl, userId: user.id })
            }).then((res) => {
                console.log(res.status);
            }).finally(() => {
                console.log("done");
            });
        }
    }

    return (
        <div>
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
                </div>
            }
            {
                (!isSignedIn || !isLoaded) &&
                <div>
                    <p>Not Signed in</p>
                    <Link href="..">Home</Link>
                </div>
            }
        </div>

    )
}
export default UpdatePage;