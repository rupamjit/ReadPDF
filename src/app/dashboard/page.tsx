import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const DashBoardPage = async () => {

    const {getUser} = getKindeServerSession();
    const user = await getUser();
    if(!user || !user.id){
         redirect("/auth-callback?origin=dashboard")
    }

    return(
        <div>{user.id}</div>
    )
}

export default DashBoardPage;