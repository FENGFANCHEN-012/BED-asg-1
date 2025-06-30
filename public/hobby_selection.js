
const other = document.getElementById("other")
const collection = document.getElementById("collecting")
const hobby_finish_form = document.getElementById("hobby-finish-form")
const blue_button = document.getElementsByClassName("blue-button")
other.addEventListener("click",function(){
    window.location.href="other.html"
})
hobby_finish_form.addEventListener("submit",function(event){
    event.preventDefault();
    fetch(); // API function;
    window.location.href="Hobby-selection-complete.html"
})

collection.addEventListener("submit",function(event){
    if (window.location.pathname === "/hobby-description.html") {
     window.location.href="" // main page
    }else{
event.preventDefault();
fetch(); // API function
window.location.href="hobby-description.html"}


})





