// Lista de produtos disponíveis
const produtosPadrao = [
  { nome: "Pastel", preco: 7.00, imagem: "imagens/pastel.jpg", disponivel: 40 },
  { nome: "Cachorro-quente", preco: 6.00, imagem: "imagens/hotdog.jpg", disponivel: 15 },
  { nome: "Coxinha (frango)", preco: 2.00, imagem: "imagens/coxinha.jpg", disponivel: 0 },
  { nome: "Bolo vulcão (fatia)", preco: 4.00, imagem: "imagens/bolo.jpg", disponivel: 8 },
  { nome: "Pão de Pizza (frango)", preco: 5.00, imagem: "imagens/pizza.jpg", disponivel: 0 },
  { nome: "Refrigerante", preco: 3.00, imagem: "imagens/refri.jpg", disponivel: 5 },
  { nome: "Morango do Amor", preco: 8.00, imagem: "imagens/morango.jpg", disponivel: 0 },
];

let produtos = JSON.parse(localStorage.getItem('produtosDisponiveis')) || produtosPadrao;

const saboresPastel = ["Frango", "Carne-moida", "Queijo", "Calabresa", "Presunto"];
const complementosPastel = ["Cebola", "Tomate", "Milho", "Ketchup", "Mostarda", "Maionese"];
const complementosHotDog = ["Mostarda", "Ketchup", "Maionese", "Batata Palha", "Cebola", "Tomate", "Purê", "Milho"];
const chavePix = "81993391132";

let total = 0;
const itensCarrinho = [];

const container = document.getElementById("produtos");

produtos.forEach((prod, index) => {
  const card = document.createElement("div");
  card.className = "card";

  let saboresHTML = "";
  let complementosHTML = "";
  let complementosHotDogHTML = "";

  if (prod.nome === "Pastel") {
    saboresHTML = `
      <div class="sabores-complementos">
        <div class="sabores">
          <p><strong>Sabores (máx. 3):</strong></p>
          ${saboresPastel.map(sabor =>
            `<label><input type="checkbox" name="sabor-${index}" value="${sabor}" onchange="limitarSabores('sabor-${index}')"> ${sabor}</label><br>`
          ).join("")}
        </div>
        <div class="complementos">
          <p><strong>Complementos:</strong></p>
          ${complementosPastel.map(comp =>
            `<label><input type="checkbox" name="comp-${index}" value="${comp}"> ${comp}</label><br>`
          ).join("")}
        </div>
      </div>
    `;
  }

  if (prod.nome === "Cachorro-quente") {
    complementosHotDogHTML = `
      <div class="complementos">
        <p><strong>Complementos:</strong></p>
        ${complementosHotDog.map(comp =>
          `<label><input type="checkbox" name="comp-hotdog-${index}" value="${comp}"> ${comp}</label><br>`
        ).join("")}
      </div>
    `;
  } 

  card.innerHTML = `
    <img src="${prod.imagem}" alt="${prod.nome}" />
    <h3>${prod.nome}</h3>
    <p>R$ ${prod.preco.toFixed(2)}</p>
    <p>Disponível: <span id="disp-${index}">${prod.disponivel}</span></p>
    ${saboresHTML}
    ${complementosHTML}
    ${complementosHotDogHTML}
    <button onclick='adicionarProdutoComSabores(${index})'>Adicionar</button>
  `;

  container.appendChild(card);
});

function limitarSabores(name) {
  const selecionados = document.querySelectorAll(`input[name="${name}"]:checked`);
  if (selecionados.length > 3) {
    alert("Você só pode escolher até 3 sabores.");
    selecionados[selecionados.length - 1].checked = false;
  }
}

function salvarDisponibilidade() {
  localStorage.setItem('produtosDisponiveis', JSON.stringify(produtos));
}

function adicionarProdutoComSabores(index) {
  const produto = produtos[index];

  if (produto.disponivel <= 0) {
    alert("Produto esgotado!");
    return;
  }

  let nomeFinal = produto.nome;

  if (produto.nome === "Pastel") {
    const saboresSelecionados = document.querySelectorAll(`input[name="sabor-${index}"]:checked`);
    const complementosSelecionados = document.querySelectorAll(`input[name="comp-${index}"]:checked`);

    if (saboresSelecionados.length === 0 || saboresSelecionados.length > 3) {
      alert("Escolha de 1 a 3 sabores para o pastel.");
      return;
    }

    const sabores = Array.from(saboresSelecionados).map(i => i.value);
    const complementos = Array.from(complementosSelecionados).map(i => i.value);

    nomeFinal += ` (${sabores.join(", ")})`;
    if (complementos.length > 0) {
      nomeFinal += ` [${complementos.join(", ")}]`;
    }

    saboresSelecionados.forEach(cb => cb.checked = false);
    complementosSelecionados.forEach(cb => cb.checked = false);
  }

  if (produto.nome === "Cachorro-quente") {
    const complementosSelecionados = document.querySelectorAll(`input[name="comp-hotdog-${index}"]:checked`);
    const complementos = Array.from(complementosSelecionados).map(i => i.value);
  
    if (complementos.length > 0) { 
      nomeFinal += ` [${complementos.join(", ")}]`;
    }
    
    complementosSelecionados.forEach(cb => cb.checked = false);
  }

  const itemExistente = itensCarrinho.find(item => item.nome === nomeFinal);
  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    itensCarrinho.push({
      nome: nomeFinal,
      preco: produto.preco,
      quantidade: 1,
      idProduto: index
    });
  }

  produto.disponivel--;
  total += produto.preco;

  atualizarDisponivel(index);
  salvarDisponibilidade();
  atualizarCarrinho();
  atualizarResumoCarrinho();
}

function atualizarDisponivel(index) {
  document.getElementById(`disp-${index}`).textContent = produtos[index].disponivel;
}

function atualizarCarrinho() {
  document.getElementById("total").textContent = "R$ " + total.toFixed(2);
  const lista = document.getElementById("itens-carrinho");
  lista.innerHTML = "";

  itensCarrinho.forEach((item, index) => {
    const precoTotal = item.preco * item.quantidade;

    const li = document.createElement("li");
    li.innerHTML = `
      ${item.nome} - 
      <button onclick="decrementar(${index})">–</button>
      ${item.quantidade}
      <button onclick="incrementar(${index})">+</button>
      = R$ ${precoTotal.toFixed(2)}
      <button class="remover-btn" onclick="removerProduto(${index})">Remover</button>
    `;
    lista.appendChild(li);
  });

  const btnExistente = document.getElementById("finalizar");
  if (itensCarrinho.length > 0 && !btnExistente) {
    const btnFinalizar = document.createElement("button");
    btnFinalizar.id = "finalizar";
    btnFinalizar.textContent = "Finalizar pedido via WhatsApp";
    btnFinalizar.onclick = finalizarPedido;
    document.getElementById("carrinho").appendChild(btnFinalizar);
  } else if (itensCarrinho.length === 0 && btnExistente) {
    btnExistente.remove();
  }
}

function incrementar(index) {
  const item = itensCarrinho[index];
  const produto = produtos[item.idProduto];

  if (produto.disponivel <= 0) {
    alert("Produto esgotado!");
    return;
  }

  item.quantidade++;
  produto.disponivel--;
  total += item.preco;

  atualizarDisponivel(item.idProduto);
  salvarDisponibilidade();
  atualizarCarrinho();
  atualizarResumoCarrinho();
}

function decrementar(index) {
  const item = itensCarrinho[index];
  const produto = produtos[item.idProduto];

  if (item.quantidade > 1) {
    item.quantidade--;
    produto.disponivel++;
    total -= item.preco;
    atualizarDisponivel(item.idProduto);
    salvarDisponibilidade();
  } else {
    removerProduto(index);
    return;
  }

  atualizarCarrinho();
  atualizarResumoCarrinho();
}

function removerProduto(index) {
  const item = itensCarrinho[index];
  const produto = produtos[item.idProduto];

  produto.disponivel += item.quantidade;
  total -= item.preco * item.quantidade;

  itensCarrinho.splice(index, 1);
  atualizarDisponivel(item.idProduto);
  salvarDisponibilidade();
  atualizarCarrinho();
  atualizarResumoCarrinho();
}

function finalizarPedido() {
  if (itensCarrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const lista = itensCarrinho.map(item =>
    `• ${item.nome} x${item.quantidade} = R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}`
  ).join("%0A");

  let subtotal = itensCarrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  let entrega = 0;

  const tipoEntrega = document.querySelector('input[name="entrega"]:checked')?.value || "Não informado";
  const formaPagamento = document.querySelector('input[name="pagamento"]:checked')?.value || "Não informado";
  const endereco = tipoEntrega === "Delivery" ? document.getElementById("endereco").value.trim() : "";

  if (tipoEntrega === "Delivery") {
    entrega = 3;
  }

  const total = subtotal + entrega;
  const chavePix = "81993381132";

  // Mensagem principal
  let mensagem = `Olá! Gostaria de fazer um pedido:%0A%0A${lista}` +
                 `%0A%0ASubtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}` +
                 `%0AEntrega: R$ ${entrega.toFixed(2).replace('.', ',')}` +
                 `%0ATotal: R$ ${total.toFixed(2).replace('.', ',')}` +
                 `%0A%0AEntrega: ${tipoEntrega}${endereco ? " - " + endereco : ""}` +
                 `%0APagamento: ${formaPagamento}`;

  // Adiciona chave Pix só se a forma for Pix
  if (formaPagamento.toLowerCase() === "pix") {
    mensagem += `%0A%0AChave Pix: ${chavePix}`;
  }

  const numero = "5581993391132"; // Substitua pelo seu número
  window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
}

document.querySelectorAll('input[name="entrega"]').forEach(input => {
  input.addEventListener('change', () => {
    const campoEndereco = document.getElementById('campo-endereco');
    if (input.value === "Delivery") {
      campoEndereco.style.display = 'block';
    } else {
      campoEndereco.style.display = 'none';
    }
  });
});

function atualizarResumoCarrinho() {
  const total = itensCarrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const quantidadeTotal = itensCarrinho.reduce((acc, item) => acc + item.quantidade, 0);

  document.getElementById("total-resumo").textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
  document.getElementById("qtd-itens").textContent = quantidadeTotal;
}

function mostrarCarrinho() {
  document.getElementById("carrinho").style.display = "block";
  document.getElementById("resumo-carrinho").style.display = "none";
}

function fecharCarrinho() {
  document.getElementById("carrinho").style.display = "none";
  document.getElementById("resumo-carrinho").style.display = "block";
}

atualizarCarrinho();
atualizarResumoCarrinho();


