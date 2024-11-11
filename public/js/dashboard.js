document.getElementById("profile").addEventListener("click",()=>{
    if(document.querySelector(".profile_option").style.display== "flex"){
        document.querySelector(".profile_option").style.display = "none";
    }else{
        document.querySelector(".profile_option").style.display = "flex";

    }
})