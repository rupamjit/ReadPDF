import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  pdfUploader: f({
    pdf: {
      maxFileSize: "4MB",
    },
  })
    .middleware(async ({}) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new UploadThingError("UNAUTHORIZED");

      return { userID: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userID,
          // url: `https://uploadthing-grod-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
