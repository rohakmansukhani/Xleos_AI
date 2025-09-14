"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { setAuthToken, setUserApprovalStatus } from "@/utils/auth";

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const exchangeCode = async () => {
      const code = params.get("code");
      if (!code) {
        toast.error("No authorization code received");
        router.push("/auth/login");
        return;
      }

      try {
        console.log("Exchanging code for token:", code);
        console.log("Backend URL:", process.env.NEXT_PUBLIC_BASEURL);
        
        // Call your FastAPI backend's GET /auth/callback endpoint
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASEURL}/auth/callback`,
          {
            params: { code },
            withCredentials: true, // Important for receiving cookies
            headers: {
              'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
              'Accept': 'application/json',
            },
          }
        );

        console.log("Backend response:", response.data);

        if (response.status === 200 && response.data.message === "Login successful") {
          // The backend sets the access_token as an HttpOnly cookie
          // We'll create a simple token for frontend auth state management
          const frontendToken = `AUTH0_${Date.now()}`;
          setAuthToken(frontendToken);
          
          // Set user approval status from backend response or default to true
          const userApproved = response.data.user?.approved ?? true;
          setUserApprovalStatus(userApproved);

          toast.success("Login successful!");
          router.push("/");
          router.refresh();
        } else {
          console.error("Unexpected response:", response);
          toast.error("Login failed - unexpected response");
          router.push("/auth/login");
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        if (axios.isAxiosError(error)) {
          const errorMessage = error.response?.data?.detail || "Login failed";
          toast.error(errorMessage);
        } else {
          toast.error("Login failed");
        }
        router.push("/auth/login");
      }
    };

    exchangeCode();
  }, [params, router]);

  return (
    <div className="text-center flex flex-col items-center">
      <Loader className="animate-spin" size={48} color="#FA956A" />
      <span className="ml-4 text-lg text-[#FA956A] mt-2">Processing login...</span>
    </div>
  );
}

export default function Callback() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175] flex items-center justify-center">
      <Suspense
        fallback={
          <div className="text-center flex flex-col items-center">
            <Loader className="animate-spin" size={48} color="#FA956A" />
            <span className="ml-4 text-lg text-[#FA956A] mt-2">Loading...</span>
          </div>
        }
      >
        <CallbackInner />
      </Suspense>
    </div>
  );
}