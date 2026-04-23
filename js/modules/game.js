import { embaralhar } from "./utils.js";

export function criarJogo(cards, tentativasElemento, timerElemento, onJogoFinalizado) {
    let primeiraCarta = null;
    let segundaCarta = null;
    let tentativas = 0;
    let bloqueado = false;
    let paresEncontrados = 0;
    let totalPares = 0;
    let timerInterval = null;
    let tempo = 0; // in seconds

    function iniciar(palavras) {
        const embaralhadas = embaralhar([...palavras, ...palavras]);

        totalPares = palavras.length;
        paresEncontrados = 0;
        tentativas = 0;
        bloqueado = false;
        primeiraCarta = null;
        segundaCarta = null;
        tempo = 0;

        atualizarTentativas();
        atualizarTimer();

        pararTimer();
        // Timer inicia no primeiro clique

        cards.forEach((card, index) => {
            card.textContent = "?";
            card.dataset.palavra = embaralhadas[index];
            card.classList.remove("selecionado", "acertou");
            card.disabled = false;
            card.onclick = () => virar(card);
        });
    }

    function virar(card) {
        // Iniciar timer no primeiro clique
        if (!timerInterval && paresEncontrados < totalPares) {
            iniciarTimer();
        }

        if (bloqueado) return;
        if (card === primeiraCarta) return;
        if (card.classList.contains("acertou")) return;

        card.textContent = card.dataset.palavra;
        card.classList.add("selecionado");

        if (!primeiraCarta) {
            primeiraCarta = card;
            return;
        }

        segundaCarta = card;
        tentativas++;
        atualizarTentativas();
        verificar();
    }

    function verificar() {
        if (!primeiraCarta || !segundaCarta) return;

        const acertou = primeiraCarta.dataset.palavra === segundaCarta.dataset.palavra;

        if (acertou) {
            primeiraCarta.classList.remove("selecionado");
            segundaCarta.classList.remove("selecionado");

            primeiraCarta.classList.add("acertou");
            segundaCarta.classList.add("acertou");

            primeiraCarta.disabled = true;
            segundaCarta.disabled = true;

            paresEncontrados++;
            primeiraCarta = null;
            segundaCarta = null;

            if (paresEncontrados === totalPares) {
                pararTimer();
                setTimeout(() => {
                    if (onJogoFinalizado) {
                        onJogoFinalizado();
                    }
                }, 2000);
            }

            return;
        }

        bloqueado = true;

        setTimeout(() => {
            primeiraCarta.textContent = "?";
            segundaCarta.textContent = "?";

            primeiraCarta.classList.remove("selecionado");
            segundaCarta.classList.remove("selecionado");

            primeiraCarta = null;
            segundaCarta = null;
            bloqueado = false;
        }, 700);
    }

    function atualizarTentativas() {
        if (tentativasElemento) {
            tentativasElemento.textContent = `Tentativas: ${tentativas}`;
        }
    }

    function iniciarTimer() {
        timerInterval = setInterval(() => {
            tempo++;
            atualizarTimer();
        }, 1000);
    }

    function pararTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    function atualizarTimer() {
        if (timerElemento) {
            const minutos = Math.floor(tempo / 60);
            const segundos = tempo % 60;
            timerElemento.textContent = `Tempo: ${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        }
    }

    function getTempo() {
        return tempo;
    }

    function salvarEstado() {
        const estado = {
            palavras: Array.from(cards).map(card => card.dataset.palavra),
            estados: Array.from(cards).map(card => ({
                textContent: card.textContent,
                classes: Array.from(card.classList),
                disabled: card.disabled
            })),
            tentativas,
            tempo,
            paresEncontrados,
            totalPares
        };
        localStorage.setItem('jogoMemoriaEstado', JSON.stringify(estado));
    }

    function carregarEstado() {
        const estadoSalvo = localStorage.getItem('jogoMemoriaEstado');
        if (!estadoSalvo) return null;

        return JSON.parse(estadoSalvo);
    }

    function restaurarEstado(estado) {
        if (!estado) return false;

        tentativas = estado.tentativas;
        tempo = estado.tempo;
        paresEncontrados = estado.paresEncontrados;
        totalPares = estado.totalPares;

        atualizarTentativas();
        atualizarTimer();

        cards.forEach((card, index) => {
            card.dataset.palavra = estado.palavras[index];
            card.textContent = estado.estados[index].textContent;
            card.className = 'card ' + estado.estados[index].classes.join(' ');
            card.disabled = estado.estados[index].disabled;
            card.onclick = () => virar(card);
        });

        if (paresEncontrados < totalPares) {
            iniciarTimer();
        }

        return true;
    }

    function limparEstado() {
        localStorage.removeItem('jogoMemoriaEstado');
    }

    function reiniciar(palavras) {
        pararTimer();
        limparEstado();
        iniciar(palavras);
    }

    function getTentativas() {
        return tentativas;
    }

    function jogoFinalizado() {
        return paresEncontrados === totalPares && totalPares > 0;
    }

    return {
        iniciar,
        reiniciar,
        getTentativas,
        getTempo,
        salvarEstado,
        carregarEstado,
        restaurarEstado,
        limparEstado,
        jogoFinalizado,
    };
}