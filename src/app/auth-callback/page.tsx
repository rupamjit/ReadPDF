"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const origin = searchParams.get("origin");

  const { data, isSuccess, isError, error } = trpc.authCallback.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (isSuccess && data?.success) {
      router.replace(origin ? `/${origin}` : "/dashboard"); 
    } else if (isError && error.data?.code === "UNAUTHORIZED") {
      router.replace("/sign-in");
    }
  }, [isSuccess, isError, data, error, origin, router]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
        <h3 className="font-semibold text-xl">Setting Up Your Account...</h3>
        <p>You will be automatically redirected</p>
      </div>
    </div>
  );
};

export default Page;
