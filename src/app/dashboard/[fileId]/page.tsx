import ChatWrapper from "@/components/Chat/ChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileId: string;
  };
}

const Page = async ({ params }: PageProps) => {
  // retrieve the file id
  const { fileId } =  params;
console.log(fileId)
  const { getUser } = getKindeServerSession();

  const user = await getUser();

  if (!user || !user.id) {
    redirect(`/auth-callback?origin=dashboard/${fileId}`);
  }

  const file = await db.file.findFirst({
    where:{
        id:fileId,
        userId:user.id
    }
  })
  // console.log(file)

  if(!file) notFound()

  return <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
    <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left Side */}
        <div className="flex-1 xl:flex">
            <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
                <PdfRenderer url={file.url}/>
            </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-1 lg:border-t-0">
            <ChatWrapper fileId={fileId}/>
        </div>
    </div>
  </div>;
};

export default Page;
