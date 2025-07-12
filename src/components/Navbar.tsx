"use client"
import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs";


const Navbar = () => {
  return (
    <nav className="sticky h-20 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all ">
      <MaxWidthWrapper>
        <div className="flex h-20 items-center justify-between border-b border-zinc-200 ">
          <Link href="/" className="flex text-2xl z-40 font-semibold">
            <span>ReadPDF</span>
          </Link>

          <div className="hidden items-center space-x-4 sm:flex">
            <>
              <Link
                className={buttonVariants({
                  variant: "ghost",
                  size: "lg",
                })}
                href="/pricing"
              >
                Pricing
              </Link>
              <LoginLink
                className={buttonVariants({
                  variant: "ghost",
                  size: "lg",
                })}
              >
                Sign In
              </LoginLink>
              <RegisterLink className={buttonVariants({
                variant:"default",
                size:"lg"
              })}>
                Get Started
              </RegisterLink>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
