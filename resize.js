
function updateDims() {
  document.getElementById("text-label").value = window.innerWidth + " x " + window.innerHeight; 
}

window.addEventListener('resize', 
    (msg) => {
        document.getElementById("text-label").value = window.innerWidth + " x " + window.innerHeight; 
    }
);

