import { listar, remover, limpar } from "../../data/apoiadores.js";
import { badge, alerta, listaDetalhes } from "../componentes.js";
import { escapeHTML as e, delegar, qs } from "../../core/dom.js";
import { confirmar, mostrarToast } from "../../modules/feedback.js";

const rotulosTipo = { doador: "Doador", voluntario: "Voluntário", ambos: "Doador e voluntário" };
const tiposBadge = { doador: "sucesso", voluntario: "", ambos: "neutro" };

/* Mostra só os dois últimos dígitos do CPF na lista (privacidade). */
const cpfOculto = (cpf) => `***.***.***-${String(cpf).slice(-2)}`;

const cartaoApoiador = (a) => `
  <article class="card projeto apoiador col-12 col-sm-6 col-lg-4" aria-labelledby="ap-${e(a.id)}">
    <header>
      <h2 id="ap-${e(a.id)}">${e(a.nome)}</h2>
      ${badge({ texto: rotulosTipo[a.tipo] ?? a.tipo, tipo: tiposBadge[a.tipo] ?? "" })}
    </header>
    ${listaDetalhes({
      Cidade: `${a.cidade}/${a.estado}`,
      CPF: cpfOculto(a.cpf),
      "Cadastrado em": new Date(a.criadoEm).toLocaleDateString("pt-BR"),
    })}
    <button type="button" class="botao botao--perigo botao--pequeno" data-remover="${e(a.id)}" aria-label="Remover ${e(a.nome)}">Remover</button>
  </article>`;

function conteudo() {
  const lista = listar();
  if (lista.length === 0) {
    return `
      ${alerta({ texto: "Nenhum apoiador cadastrado neste navegador ainda." })}
      <a class="botao" href="#/cadastro">Fazer o primeiro cadastro</a>`;
  }
  return `
    <div class="lista-topo">
      <p><strong>${lista.length}</strong> ${lista.length === 1 ? "apoiador cadastrado" : "apoiadores cadastrados"}</p>
      <button type="button" class="botao botao--perigo botao--pequeno" data-limpar>Remover todos</button>
    </div>
    <div class="grid">${lista.map(cartaoApoiador).join("")}</div>`;
}

export const apoiadores = {
  caminho: "/apoiadores",
  titulo: "Apoiadores cadastrados",
  render: () => `
    <section class="secao" aria-labelledby="titulo-apoiadores">
      <div class="container">
        <h1 id="titulo-apoiadores">Apoiadores cadastrados</h1>
        <p>Lista dos cadastros salvos neste navegador (localStorage). Os dados continuam aqui mesmo depois de fechar e abrir a página.</p>
        <div id="lista-apoiadores">${conteudo()}</div>
      </div>
    </section>`,

  aposRenderizar(raiz) {
    const area = qs("#lista-apoiadores", raiz);
    const atualizar = () => { area.innerHTML = conteudo(); };

    delegar(area, "click", "[data-remover]", async (_e, botao) => {
      const ok = await confirmar({ titulo: "Remover apoiador", texto: "Este cadastro será apagado do navegador. Deseja continuar?", rotuloConfirmar: "Remover" });
      if (!ok) return;
      remover(botao.dataset.remover);
      atualizar();
      mostrarToast("Cadastro removido.", "aviso");
    });

    delegar(area, "click", "[data-limpar]", async () => {
      const ok = await confirmar({ titulo: "Remover todos", texto: "Todos os cadastros serão apagados deste navegador. Deseja continuar?", rotuloConfirmar: "Remover todos" });
      if (!ok) return;
      limpar();
      atualizar();
      mostrarToast("Todos os cadastros foram removidos.", "aviso");
    });
  },
};
