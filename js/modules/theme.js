export function iniciarTema() {
    const temaSalvo = localStorage.getItem("tema") || "light";
    aplicarTema(temaSalvo);
}

export function alterarTema() {
    const temaAtual = document.body.classList.contains("dark") ? "dark" : "light";
    const novoTema = temaAtual === "dark" ? "light" : "dark";

    aplicarTema(novoTema);
    localStorage.setItem("tema", novoTema);
}

function aplicarTema(tema) {
    document.body.classList.toggle("dark", tema === "dark");

    const icone = document.querySelector("#btnTema i");

    if (icone) {
        icone.className = tema === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
}