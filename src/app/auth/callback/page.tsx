"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import Image from "next/image"; // <-- Add this import

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { checkUserStatus } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');
  const [mounted, setMounted] = useState(false);

  // Wait for hydration
  useEffect(() => {
    console.log('🔄 Callback: Setting mounted to true');
    setMounted(true);
  }, []);

  useEffect(() => {
    // Don't wait for hydration for OAuth processing - codes expire quickly!
    console.log('🔄 Callback: Processing callback immediately...');
    console.log('🔍 Current URL:', window.location.href);
    console.log('🔍 URL Params:', Array.from(params.entries()));

    const handleCallback = async () => {
      const code = params.get("code");
      const error = params.get("error");
      const error_description = params.get("error_description");
      const callbackStatus = params.get("status");

      console.log('📝 Callback params:', { code: !!code, error, error_description, callbackStatus });

      // Handle direct status from backend redirect
      if (callbackStatus) {
        if (callbackStatus === 'success') {
          setStatus('success');
          setMessage('Authentication successful! Welcome to Xleos!');
          
          // Wait for hydration before calling AuthContext methods
          const waitForHydration = () => {
            return new Promise<void>((resolve) => {
              if (mounted) {
                resolve();
              } else {
                const checkMounted = () => {
                  if (mounted) {
                    resolve();
                  } else {
                    setTimeout(checkMounted, 100);
                  }
                };
                checkMounted();
              }
            });
          };

          await waitForHydration();

          // Refresh user status from backend
          try {
            await checkUserStatus();
            toast.success("Login successful!");
            setTimeout(() => router.push("/"), 1500);
          } catch (error) {
            console.error('Failed to check user status:', error);
            setTimeout(() => router.push("/"), 2000);
          }
        } else {
          setStatus('error');
          setMessage('Authentication failed');
          setTimeout(() => router.push("/"), 3000);
        }
        return;
      }

      // Handle Auth0 errors
      if (error) {
        console.error("❌ Auth0 error:", error, error_description);
        setStatus('error');
        setMessage(`Authentication failed: ${error_description || error}`);
        toast.error("Authentication failed");
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      if (!code) {
        console.error("❌ No authorization code received");
        setStatus('error');
        setMessage("No authorization code received");
        toast.error("Authentication failed - no code received");
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
        return;
      }

      try {
        setMessage('Exchanging authorization code...');
        console.log("🔄 Exchanging code for token:", code);

        // Call your FastAPI backend's /auth/callback endpoint
        const response = await authApi.exchangeCode(code);

        console.log("📊 Backend response status:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Auth callback failed:", response.status, errorData);
          
          setStatus('error');
          setMessage(errorData.error || `Authentication failed (${response.status})`);
          toast.error("Authentication failed");
          
          setTimeout(() => {
            router.push("/");
          }, 3000);
          return;
        }

        const data = await response.json();
        console.log("✅ Backend response:", data);

        if (data.message === "Login successful") {
          console.log("🎉 Login successful, setting cookies and checking user status...");
          setStatus('success');
          setMessage('Authentication successful! Checking account status...');

          // Wait longer for cookie to be properly set and hydration to complete
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Wait for hydration before calling AuthContext methods
          const waitForHydration = () => {
            return new Promise<void>((resolve) => {
              if (mounted) {
                resolve();
              } else {
                const checkMounted = () => {
                  if (mounted) {
                    resolve();
                  } else {
                    setTimeout(checkMounted, 100);
                  }
                };
                checkMounted();
              }
            });
          };

          await waitForHydration();

          // Refresh user status from backend with retry logic
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              console.log(`🔄 Attempt ${retryCount + 1} to check user status`);
              await checkUserStatus();
              console.log("✅ User status checked successfully - auth should be set now");

              setMessage('Welcome to Xleos! Redirecting...');
              toast.success("Login successful!");

              console.log("🏠 Redirecting to home page in 1.5 seconds...");
              setTimeout(() => {
                router.push("/");
              }, 1500);
              break; // Success, exit retry loop
            } catch (error) {
              retryCount++;
              console.error(`❌ Attempt ${retryCount} failed to check user status:`, error);

              if (retryCount >= maxRetries) {
                console.error('All retry attempts failed, redirecting anyway');
                setMessage('Login successful! Redirecting...');
                toast.success("Login successful!");
                setTimeout(() => {
                  router.push("/");
                }, 2000);
              } else {
                // Wait before retry
                setMessage(`Checking account status... (${retryCount}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
          }
        } else {
          console.error("❌ Unexpected response:", data);
          setStatus('error');
          setMessage("Authentication failed - unexpected response");
          toast.error("Login failed");
          
          setTimeout(() => {
            router.push("/");
          }, 3000);
        }
      } catch (error) {
        console.error("❌ Auth callback error:", error);
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        
        setStatus('error');
        setMessage(errorMessage);
        toast.error(errorMessage);
        
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    handleCallback();
  }, [params, router, checkUserStatus]);

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="animate-spin w-12 h-12 text-purple-400" />;
      case 'success':
        return <CheckCircle className="w-12 h-12 text-green-400" />;
      case 'error':
        return <XCircle className="w-12 h-12 text-red-400" />;
    }
  };

  const getMessageColor = () => {
    switch (status) {
      case 'processing':
        return 'text-purple-400';
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
    }
  };

  return (
    <div className="text-center flex flex-col items-center">
      <div className="mb-6">
        {getIcon()}
      </div>
      <h2 className="text-2xl font-bold text-white mb-4">
        {status === 'processing' && 'Authenticating...'}
        {status === 'success' && 'Welcome to Xleos!'}
        {status === 'error' && 'Authentication Failed'}
      </h2>
      <p className={`text-lg ${getMessageColor()}`}>
        {message}
      </p>
      {status === 'error' && (
        <p className="text-white/60 text-sm mt-4">
          Redirecting to home page in a few seconds...
        </p>
      )}
      {status === 'success' && (
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white/80 text-sm">
            Account status verified successfully!
          </p>
        </div>
      )}
    </div>
  );
}

export default function Callback() {
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-tr from-black via-[#12062c] to-[#2e2175] flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute"
        style={{
          top: 0,
          right: 0,
          width: "55vw",
          height: "100vh",
          zIndex: 1,
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        aria-hidden="true"
      >
        <Image
          src="/cubes.svg"
          alt=""
          width={1000}
          height={1000}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            opacity: 0.23,
            userSelect: "none",
          }}
          draggable={false}
          priority
        />
      </div>

      <div className="relative z-10 max-w-md w-full mx-4">
        <div className="rounded-3xl bg-white/4 border border-white/10 backdrop-blur-xl shadow-xl p-10 relative overflow-hidden">
          <Image
            src="/elements/flower.png"
            alt=""
            width={64}
            height={64}
            className="absolute right-4 top-4 w-16 opacity-10 pointer-events-none blur-[2px]"
            priority
          />

          <Suspense
            fallback={
              <div className="text-center flex flex-col items-center">
                <Loader2 className="animate-spin w-12 h-12 text-purple-400 mb-6" />
                <h2 className="text-2xl font-bold text-white mb-4">Loading...</h2>
                <p className="text-lg text-purple-400">Initializing authentication...</p>
              </div>
            }
          >
            <CallbackInner />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
