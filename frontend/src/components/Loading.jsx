import React, { useState, useEffect } from "react";

const Loading = ({ loading }) => {
  const [loadingText, setLoadingText] = useState("Loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!loading) return; // Stop effects if not loading

    const messages = ["Loading", "Processing data", "Almost there", "Preparing content"];
    let messageIndex = 0;

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingText(messages[messageIndex]);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const increment = prev < 70 ? 5 : prev < 90 ? 2 : 1;
        return prev >= 100 ? 100 : prev + increment;
      });
    }, 300);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [loading]);

  if (!loading) return null; // Hide component when loading is false

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 shadow-2xl border border-slate-700 max-w-md w-full mx-4 transition-all">
        {/* Spinner */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-solid border-blue-200 border-opacity-20 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-solid border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-blue-300">{Math.round(progress)}%</span>
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <h3 className="text-white text-xl font-medium mb-2">{loadingText}</h3>
          <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-slate-400 text-sm">Please wait while we prepare your experience</p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center mt-4">
          <span className="h-2 w-2 bg-blue-400 rounded-full mx-1 animate-pulse"></span>
          <span className="h-2 w-2 bg-blue-400 rounded-full mx-1 animate-pulse" style={{ animationDelay: "300ms" }}></span>
          <span className="h-2 w-2 bg-blue-400 rounded-full mx-1 animate-pulse" style={{ animationDelay: "600ms" }}></span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
