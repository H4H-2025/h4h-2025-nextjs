"use client";
import React, { useEffect } from 'react';

const ClientLoginPage = () => {
  // This effect will load the Google API script dynamically
  useEffect(() => {
    // Dynamically load the Google API script
    const script = document.createElement("script");
    script.src = "https://apis.google.com/js/api.js";
    script.async = true;

    // Once the script is loaded, initialize the gapi client
    script.onload = () => {
      console.log('Google API script loaded');
      if (window.gapi) {
        window.gapi.load("client:auth2", () => {
          // Initialize gapi.auth2 with your OAuth 2.0 client ID
          window.gapi.auth2.init({
            client_id: "897169920656-qge61k85p0h127ac0iarnkta04pe6als.apps.googleusercontent.com", // Replace with your actual OAuth 2.0 client ID from Google Developer Console
          }).then(() => {
            console.log("Google API client initialized");
          }).catch((error: any) => {
            console.error("Error initializing Google API client:", error);
          });
        });
      } else {
        console.error("Google API not available in window object.");
      }
    };

    // Append the script to the document
    document.body.appendChild(script);

    // Clean up the script when the component unmounts
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // This function will handle the login process
  const handleLogin = () => {
    const GoogleAuth = window.gapi.auth2.getAuthInstance();
    if (GoogleAuth) {
      GoogleAuth.signIn().then(() => {
        console.log("User signed in");
        const profile = GoogleAuth.currentUser.get().getBasicProfile();
        console.log("Name: " + profile.getName());
        console.log("Email: " + profile.getEmail());
        // Here you can handle the signed-in user's data, such as sending it to your server
      }).catch((error: any) => {
        console.error("Google login failed:", error);
      });
    } else {
      console.error("GoogleAuth instance is not initialized.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Google Login</h1>

          {/* The Google Login button */}
          <button 
            className="px-6 py-3 bg-blue-500 text-white rounded-full" 
            onClick={handleLogin}
          >
            Login with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLoginPage;
