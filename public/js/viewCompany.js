function tougleViewDetails(id){
    const view = document.getElementById("dropdown-"+id);
    view.style.display == "grid" ? view.style.display = "none": view.style.display = "grid"
}
