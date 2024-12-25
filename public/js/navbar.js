document.getElementById("profile").addEventListener("click",()=>{
    if(document.querySelector(".profile_option").style.display== "flex"){
        document.querySelector(".profile_option").style.display = "none";
    }else{
        document.querySelector(".profile_option").style.display = "flex";

    }
})

document.getElementById("hamburger").addEventListener("click",()=>{
document.querySelector(".sidebar_menu").style.left = 0
})

document.getElementById("hideside").addEventListener("click",()=>{
    document.querySelector(".sidebar_menu").style.left = '-300px'
})


document.querySelectorAll(".features_show").forEach(features_name=>{
    features_name.addEventListener("click",()=>{
        if(features_name.querySelector(".features").style.display== "flex"){
            features_name.querySelector(".features").style.display = "none";
            features_name.querySelector(".up").style.display = "none";
            features_name.querySelector(".down").style.display = "block";
        }else{
            features_name.querySelector(".features").style.display = "flex";
            features_name.querySelector(".up").style.display = "block";
            features_name.querySelector(".down").style.display = "none";
    
        }
    })
})
