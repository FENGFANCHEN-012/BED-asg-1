
const other = document.getElementById("other")
const collection = document.getElementById("collecting")
const hobby_finish_form = document.getElementById("hobby-finish-form")
const blue_button = document.getElementsByClassName("blue-button")
other.addEventListener("click",function(){
    window.location.href="other.html"
})



collection.addEventListener("submit",function(event){



})


hobby_finish_form.addEventListener("submit", async function(event){
    event.preventDefault();
        if (window.location.pathname === "/other.html") {
     window.location.href="hobby-description.html" // main page
    }
    else{

  let hobby = {
    "hobby":localStorage.getItem("hobby"),
    "detail":localStorage.getItem("detail"),
    "description": hobby_finish_form.innerHTML
  }
   try {
    // Make a POST request to your API endpoint
    const response = await fetch(`${apiBaseUrl}/books`, {
      method: "POST", // Specify the HTTP method
      headers: {
        "Content-Type": "application/json", // Tell the API we are sending JSON
      },
      
      body: JSON.stringify(hobby), // Send the data as a JSON string in the request body
    });
   
   }
   catch(error){
    console.log(error+"occur")
   }
   window.location.href="Hobby-selection-complete.html"
}})









