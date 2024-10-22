document.addEventListener("DOMContentLoaded", function() {
    const sections = document.querySelectorAll("section");
    
    sections.forEach(section => {
        section.addEventListener("click", function() {
            alert(`Anda mengklik bagian: ${section.querySelector("h2").innerText}`);
        });
    });
});
