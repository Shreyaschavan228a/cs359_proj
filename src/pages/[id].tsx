import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Page = () => {
    const router = useRouter();
    const id = router.asPath.slice(1);
    const { user, isSignedIn, isLoaded } = useUser();

    const checkValidUser = () => {
        if (!isSignedIn || id !== user.id) {
            router.push("../").finally(() => {
                console.log("User not logged in");
            });
        }
    }
    useEffect(() => {
        checkValidUser();
    }, [isLoaded, isSignedIn]);

    // this will never load unless the user directly navigates to this specific url without signing in
    if (!user) return <div>Something went wrong</div>


    return (
        <div>
            <p>Logged in as {user.id}</p>
        </div>
    )
}

export default Page;