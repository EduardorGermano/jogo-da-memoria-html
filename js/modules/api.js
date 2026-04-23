const urlBase = "https://darkblue-frog-779608.hostingersite.com";

export async function buscarPalavras() {
    try {
        const response = await fetch(`${urlBase}/api/palavras.php?quantidade=6`);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const palavras = await response.json();
        return palavras;
    } catch (error) {
        console.error("Erro ao buscar palavras:", error);
        return [];
    }
}

export async function salvarPartida(partida) {
    try {
        const response = await fetch(`${urlBase}/api/salvar.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(partida),
        });

        if (!response.ok) {
            let mensagemErro = `Erro ${response.status}`;

            try {
                const errorBody = await response.json();
                mensagemErro += `: ${errorBody.erro}`;
            } catch {
                mensagemErro += ": não foi possível ler a resposta de erro";
            }

            throw new Error(mensagemErro);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao salvar partida:", error);
        return null;
    }
}

export async function buscarRanking() {
    try {
        const response = await fetch(`${urlBase}/api/ranking.php`);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data.ranking)) {
            return data.ranking;
        }

        if (Array.isArray(data.data)) {
            return data.data;
        }

        if (Array.isArray(data.resultado)) {
            return data.resultado;
        }

        return [];
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        return [];
    }
}