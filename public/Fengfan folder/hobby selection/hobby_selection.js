const apiBaseUrl = "http://localhost:3000";
const other = document.getElementById("other")
const collection = document.getElementById("collecting")

const blue_button = document.getElementsByClassName("blue-button")
const submit = document.getElementById("submit")


const profile_id = localStorage.setItem("profile_id")|| 1// localStorage.getItem("profile_id",profile_id)
const user_id = localStorage.setItem("user_id") ||1




collection.addEventListener("submit",function(event){



})

async function start(text){
   

   
    
   
    try {
      
      const hobby = {
        profile_id: profile_id,
        hobbies: localStorage.getItem("hobby"), 
        detail: localStorage.getItem("detail"),
        description:   text
    };

        const response = await fetch(`${apiBaseUrl}/profile/${user_id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(hobby),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Error: ${response.status} - ${text}`);
        }

        const data = await response.json();
        console.log("Update success:", data);
           window.location.href='Hobby-selection-complete.html'

    } catch(error) {
        console.error("Update failed:", error);
        alert("Failed to update profile. Please try again.");
    }}







// alert




