/** server/uploadthing.ts */
import { createFilething, type FileRouter } from "uploadthing/server";
const f = createFilething<"pages">(); // <-- set this flag

const auth = (req: Request) => ({ id: "fakeId" }); // Fake auth function

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f
    // Set permissions and file types for this FileRoute
    .fileTypes(["image", "video"])
    .maxSize("1GB")
    .middleware((req, res) => {
      console.log("file uploaded");
      return { message: "done" };
    })
    .onUploadComplete(async ({ metadata }) => {
      // This code RUNS ON YOUR SERVER after upload
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
