import { iniciarTema, alterarTema } from "./modules/theme.js";
import { buscarPalavras, buscarRanking, salvarPartida } from "./modules/api.js";
import { criarJogo } from "./modules/game.js";

document.addEventListener("DOMContentLoaded", () => {
    iniciarTema();

    const btnMenu = document.getElementById("btnMenu");
    const headerNav = document.querySelector(".header-nav");
    const btnTema = document.getElementById("btnTema");
    const btnReiniciar = document.getElementById("btnReiniciar");
    const btnSalvar = document.getElementById("btnSalvar");
    const cards = document.querySelectorAll(".card");
    const tentativasElemento = document.getElementById("tentativas");
    const timerElemento = document.getElementById("timer");
    const rankingLista = document.getElementById("rankingLista");

    btnMenu?.addEventListener("click", () => {
        if (!headerNav) return;
        const isActive = headerNav.classList.toggle("active");
        btnMenu.setAttribute("aria-expanded", String(isActive));
    });

    btnTema?.addEventListener("click", () => {
        alterarTema();
    });

    if (cards.length > 0) {
        iniciarJogo(cards, tentativasElemento, timerElemento, btnReiniciar, btnSalvar, rankingLista);
    }
});

async function iniciarJogo(cards, tentativasElemento, timerElemento, btnReiniciar, btnSalvar, rankingLista) {
    const jogoFinalizadoCallback = async () => {
        const nome = prompt("Parabéns! Você completou o jogo!\nDigite seu nome para salvar no ranking:");

        if (!nome || !nome.trim()) {
            return;
        }

        const payload = {
            nome: nome.trim(),
            tempo: jogo.getTempo(),
            tentativas: jogo.getTentativas()
        };

        const resultado = await salvarPartida(payload);

        if (resultado) {
            await carregarRankingNaTela(rankingLista);
            alert("Pontuação salva no ranking!");
        } else {
            alert("Não foi possível salvar a pontuação.");
        }
    };

    const jogo = criarJogo(cards, tentativasElemento, timerElemento, jogoFinalizadoCallback);

    // Try to load saved state
    const estadoSalvo = jogo.carregarEstado();
    if (estadoSalvo && jogo.restaurarEstado(estadoSalvo)) {
        // Game loaded from save
    } else {
        // Start new game
        await carregarTabuleiro(jogo);
    }

    await carregarRankingNaTela(rankingLista);

    btnReiniciar?.addEventListener("click", async () => {
        await carregarTabuleiro(jogo);
    });

    btnSalvar?.addEventListener("click", async () => {
        jogo.salvarEstado();
        alert("Jogo salvo com sucesso!");
    });
}

async function carregarTabuleiro(jogo) {
    try {
        const palavras = await buscarPalavras();

        if (palavras.length > 0) {
            jogo.reiniciar(palavras);
        }
    } catch (error) {
        console.error(error);
    }
}

async function carregarRankingNaTela(rankingLista) {
    if (!rankingLista) return;

    const ranking = await buscarRanking();

    if (ranking.length === 0) {
        rankingLista.innerHTML = `<li class="ranking-empty">Nenhum registro encontrado.</li>`;
        return;
    }

    rankingLista.innerHTML = ranking
        .slice(0, 10)
        .map((item) => {
            const nome =
                item.nome ??
                item.jogador ??
                item.name ??
                item.usuario ??
                item.player ??
                "Jogador";

            const tentativas =
                item.tentativas ??
                item.tentativa ??
                item.tries ??
                "-";

            const tempo =
                item.tempo ??
                item.time ??
                "-";

            return `
                <li>
                    <span class="ranking-name">${nome}</span><br>
                    Tentativas: ${tentativas} | Tempo: ${tempo}
                </li>
            `;
        })
        .join("");
}