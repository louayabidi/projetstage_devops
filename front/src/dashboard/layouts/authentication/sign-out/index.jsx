import { useEffect } from "react";

function SignOut() {
  useEffect(() => {
    // Call your backend API
    fetch("http://localhost:3000/api/auth/signout", {
      method: "POST",
      credentials: "include", 
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(() => {
       
        localStorage.removeItem("token");
        localStorage.removeItem("user");

      
        window.location.href = "/login";
      })
      .catch((error) => {
        console.error("Error during signout:", error);
        window.location.href = "/login"; 
      });
  }, []);

  return null; 
}

export default SignOut;
