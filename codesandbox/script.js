const { createClient } = supabase;
const SUPABASE_URL = "https://hjeqywnjxchxqvbrfgic.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqZXF5d25qeGNoeHF2YnJmZ2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjU4NTQsImV4cCI6MjA4MTUwMTg1NH0.yWo8qR_mxeTiS9L6bGobRpuCWemYDz2NzZvLhnVIZ0w";
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
  let activeUser = null;
  let cart = JSON.parse(sessionStorage.getItem("shopping_cart")) || [];
  let shippingCost = 0;
  let productRealtimeChannel = null;

  const ui = {
    loginPage: document.getElementById("login-page"),
    sellerPage: document.getElementById("main-page"),
    buyerPage: document.getElementById("buyer-page"),
    nutritionistPage: document.getElementById("nutritionist-page"),
    userEmailNutritionist: document.getElementById(
      "user-email-display-nutritionist"
    ),
    logoutBtnNutritionist: document.getElementById("logout-btn-nutritionist"),
    patientsList: document.getElementById("patients-list"),
    recommendationModal: document.getElementById("recommendation-modal"),
    closeRecommendationModalBtn: document.getElementById(
      "close-recommendation-modal-btn"
    ),
    recommendationModalTitle: document.getElementById(
      "recommendation-modal-title"
    ),
    patientDetails: document.getElementById("patient-details"),
    recommendationProductsList: document.getElementById(
      "recommendation-products-list"
    ),
    physicalFields: document.getElementById("physical-fields"),

    loginForm: document.getElementById("login-form"),
    registerForm: document.getElementById("register-form"),
    showRegisterBtn: document.getElementById("show-register-btn"),
    showLoginBtn: document.getElementById("show-login-btn"),
    loginEmail: document.getElementById("login-email"),
    loginPassword: document.getElementById("login-password"),
    regName: document.getElementById("reg-name"),
    regAge: document.getElementById("reg-age"),
    regWeight: document.getElementById("reg-weight"),
    regHeight: document.getElementById("reg-height"),
    regPhone: document.getElementById("reg-phone"),
    regEmail: document.getElementById("reg-email"),
    regPassword: document.getElementById("reg-password"),
    authError: document.getElementById("auth-error"),
    authErrorMessage: document.getElementById("auth-error-message"),
    logoutBtnSeller: document.getElementById("logout-btn-seller"),
    logoutBtnBuyer: document.getElementById("logout-btn-buyer"),
    userEmailSeller: document.getElementById("user-email-display-seller"),
    userEmailBuyer: document.getElementById("user-email-display-buyer"),
    crudForm: document.getElementById("crud-form"),
    productList: document.getElementById("products-list"),
    buyerProductList: document.getElementById("buyer-products-list"),
    recommendationsContainer: document.getElementById(
      "recommendations-container"
    ),
    recommendationsList: document.getElementById("recommendations-list"),
    cartItems: document.getElementById("cart-items"),
    cartTotal: document.getElementById("cart-total"),
    checkoutBtn: document.getElementById("checkout-btn"),
    checkoutModal: document.getElementById("checkout-modal"),
    closeModalBtn: document.getElementById("close-modal-btn"),
    calculateShippingBtn: document.getElementById("calculate-shipping-btn"),
    shippingResult: document.getElementById("shipping-result"),
    qrCodeContainer: document.getElementById("qr-code-container"),
    qrCodeImg: document.getElementById("qr-code-img"),
    qrCodeText: document.getElementById("qr-code-text"),
    summarySubtotal: document.getElementById("summary-subtotal"),
    summaryShipping: document.getElementById("summary-shipping"),
    summaryTotal: document.getElementById("summary-total"),
    finalizeOrderBtn: document.getElementById("finalize-order-btn"),
  };

  function showPage(pageId) {
    ui.loginPage.classList.add("hidden");
    ui.sellerPage.classList.add("hidden");
    ui.buyerPage.classList.add("hidden");
    ui.nutritionistPage.classList.add("hidden");
    document.getElementById(pageId).classList.remove("hidden");
  }

  function showAuthError(message) {
    ui.authErrorMessage.textContent = message;
    ui.authError.classList.remove("hidden");
  }

  function hideAuthError() {
    ui.authError.classList.add("hidden");
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  }

  ui.showRegisterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    ui.loginForm.classList.add("hidden");
    ui.registerForm.classList.remove("hidden");
    hideAuthError();
  });

  ui.showLoginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    ui.registerForm.classList.add("hidden");
    ui.loginForm.classList.remove("hidden");
    hideAuthError();
  });

  // Alterna campos de peso/altura
  // --- LÓGICA DE UI DO FORMULÁRIO DE REGISTRO ---

  function updateRegisterFormUI() {
    const role = document.querySelector('input[name="role"]:checked').value;

    // Elementos
    const physicalFields = document.getElementById("physical-fields");
    const sellerFields = document.getElementById("seller-fields");
    const sellerTypeContainer = document.getElementById(
      "seller-type-container"
    );
    const labelName = document.getElementById("label-reg-name");

    // Inputs obrigatórios condicionais
    const weightInput = ui.regWeight;
    const heightInput = ui.regHeight;
    const docInput = document.getElementById("reg-doc");
    const cityInput = document.getElementById("reg-city");
    const stateInput = document.getElementById("reg-state");

    // Reset básico
    weightInput.required = false;
    heightInput.required = false;
    docInput.required = false;
    cityInput.required = false;
    stateInput.required = false;

    if (role === "comprador") {
      // Mostra campos de comprador, esconde de vendedor
      physicalFields.classList.remove("hidden");
      sellerFields.classList.add("hidden");
      sellerTypeContainer.classList.add("hidden");

      labelName.textContent = "Nome Completo";
      weightInput.required = true;
      heightInput.required = true;
    } else if (role === "vendedor") {
      // Mostra campos de vendedor, esconde de comprador
      physicalFields.classList.add("hidden");
      sellerFields.classList.remove("hidden");
      sellerTypeContainer.classList.remove("hidden");

      docInput.required = true;
      cityInput.required = true;
      stateInput.required = true;

      // Verifica subtipo (PF ou PJ)
      updateSellerSubtypeUI();
    } else {
      // Nutricionista (esconde ambos)
      physicalFields.classList.add("hidden");
      sellerFields.classList.add("hidden");
      sellerTypeContainer.classList.add("hidden");
      labelName.textContent = "Nome Completo";
    }
  }

  function updateSellerSubtypeUI() {
    const sellerType = document.querySelector(
      'input[name="seller-type"]:checked'
    ).value;
    const labelName = document.getElementById("label-reg-name");
    const labelDoc = document.getElementById("label-reg-doc");
    const docInput = document.getElementById("reg-doc");

    if (sellerType === "PF") {
      labelName.textContent = "Nome Completo";
      labelDoc.textContent = "CPF";
      docInput.placeholder = "000.000.000-00";
    } else {
      labelName.textContent = "Nome Fantasia";
      labelDoc.textContent = "CNPJ";
      docInput.placeholder = "00.000.000/0000-00";
    }
  }

  // Listeners para mudança de Role (Comprador/Vendedor/Nutri)
  document
    .querySelectorAll('input[name="role"]')
    .forEach((input) => input.addEventListener("change", updateRegisterFormUI));

  // Listeners para mudança de Tipo de Vendedor (PF/PJ)
  document
    .querySelectorAll('input[name="seller-type"]')
    .forEach((input) =>
      input.addEventListener("change", updateSellerSubtypeUI)
    );

  // Inicializa o estado correto
  updateRegisterFormUI();

  ui.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthError();
    const email = ui.loginEmail.value.trim();
    const password = ui.loginPassword.value.trim();
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      showAuthError(`Erro de login: ${error.message}`);
    } else if (data.user) {
      activeUser = data.user;
      showToast("Login bem-sucedido!");
      // checkSession lidará com o redirecionamento
      checkSession();
    }
  });

  // --- REGISTRO ADAPTADO PARA CORRIGIR ERRO DE SCHEMA ---
  // --- REGISTRO ATUALIZADO (SUPORTA AUTO-LOGIN) ---
  ui.registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideAuthError();

    const email = ui.regEmail.value.trim();
    const password = ui.regPassword.value.trim();
    const name = ui.regName.value.trim();
    const age = parseInt(ui.regAge.value, 10);
    const phone = ui.regPhone.value.trim();
    const role = document.querySelector('input[name="role"]:checked').value;

    // Variáveis para Comprador
    let weight = null;
    let height = null;

    // Variáveis para Vendedor
    let sellerType = null; // PF ou PJ
    let docNumber = null; // CPF ou CNPJ
    let city = null;
    let state = null;

    // VALIDAÇÃO ESPECÍFICA POR ROLE
    if (role === "comprador") {
      weight = parseFloat(ui.regWeight.value);
      height = parseInt(ui.regHeight.value, 10);
      if (!weight || !height || weight <= 0 || height <= 0) {
        showAuthError("Compradores devem inserir peso e altura válidos.");
        return;
      }
    } else if (role === "vendedor") {
      sellerType = document.querySelector(
        'input[name="seller-type"]:checked'
      ).value;
      docNumber = document.getElementById("reg-doc").value.trim();
      city = document.getElementById("reg-city").value.trim();
      state = document.getElementById("reg-state").value.trim().toUpperCase();

      if (!docNumber || !city || !state) {
        showAuthError("Preencha todos os dados de localidade e documento.");
        return;
      }
      // Validação simples de tamanho do documento (opcional)
      if (sellerType === "PF" && docNumber.length < 11) {
        showAuthError("CPF inválido (muito curto).");
        return;
      }
      if (sellerType === "PJ" && docNumber.length < 14) {
        showAuthError("CNPJ inválido (muito curto).");
        return;
      }
    }

    if (age < 16) {
      showAuthError("O registro não é permitido para menores de 16 anos.");
      return;
    }
    if (password.length < 6) {
      showAuthError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    // 1. Criar usuário no Auth
    const { data: authData, error: authError } = await db.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: role,
          full_name: name,
          age: age,
          phone: phone,
          // Salva metadados extras se for vendedor
          seller_type: sellerType,
          city: city,
          state: state,
        },
      },
    });

    if (authError) {
      showAuthError(`Erro no registro: ${authError.message}`);
      return;
    }

    if (authData.user) {
      // 2. Inserir na tabela específica
      let table = "";
      let payload = {};

      if (role === "comprador") {
        table = "compradores";
        payload = {
          id_usuario: authData.user.id,
          nome_completo: name,
          telefone: phone,
          idade: age,
          peso: weight,
          altura: height,
        };
      } else if (role === "vendedor") {
        table = "vendedores";
        payload = {
          id_usuario: authData.user.id,
          nome_loja: name, // Serve para Nome (PF) ou Nome Fantasia (PJ)
          cnpj_cpf: docNumber, // Guarda o documento
          tipo_pessoa: sellerType, // PF ou PJ
          cidade: city,
          estado: state,
          telefone: phone,
        };
      } else if (role === "nutricionista") {
        table = "nutricionistas";
        payload = {
          id_usuario: authData.user.id,
          nome_completo: name,
          telefone: phone,
        };
      }

      const { error: insertError } = await db.from(table).insert(payload);

      if (insertError) {
        console.error(`Erro ao criar perfil em ${table}:`, insertError);
        showAuthError(`Erro ao criar perfil no banco: ${insertError.message}`);
        return;
      }

      // 3. Login Automático ou Aviso
      if (authData.session) {
        showToast("Registro realizado com sucesso! Entrando...", "success");
        ui.registerForm.reset();
        // Reseta UI para estado inicial
        document.querySelector(
          'input[name="role"][value="comprador"]'
        ).checked = true;
        updateRegisterFormUI();

        checkSession();
      } else {
        showToast("Registro realizado! Verifique seu email.", "success");
        ui.registerForm.reset();
        updateRegisterFormUI();
        ui.registerForm.classList.add("hidden");
        ui.loginForm.classList.remove("hidden");
      }
    }
  });

  async function handleLogout() {
    const { error } = await db.auth.signOut();
    if (error) {
      showToast(`Erro ao sair: ${error.message}`, "error");
    } else {
      // Recarrega a página para limpar memória e garantir estado zero
      window.location.reload();
    }
  }

  ui.logoutBtnSeller.addEventListener("click", handleLogout);
  ui.logoutBtnBuyer.addEventListener("click", handleLogout);
  ui.logoutBtnNutritionist.addEventListener("click", handleLogout);

  // --- SESSÃO ADAPTADA ---
  // --- SESSÃO INTELIGENTE (CORREÇÃO DE TELA BRANCA) ---
  async function checkSession() {
    const {
      data: { session },
    } = await db.auth.getSession();

    if (!session) {
      showPage("login-page");
      return;
    }

    activeUser = session.user;
    const userId = activeUser.id;

    // Procura o usuário nas tabelas para descobrir o papel REAL dele
    let realRole = null;
    let profileData = null;

    // 1. É Vendedor?
    const { data: seller } = await db
      .from("vendedores")
      .select("*")
      .eq("id_usuario", userId)
      .maybeSingle();
    if (seller) {
      realRole = "vendedor";
      profileData = seller;
    }

    // 2. É Comprador?
    if (!realRole) {
      const { data: buyer } = await db
        .from("compradores")
        .select("*")
        .eq("id_usuario", userId)
        .maybeSingle();
      if (buyer) {
        realRole = "comprador";
        profileData = buyer;
      }
    }

    // 3. É Nutricionista?
    if (!realRole) {
      const { data: nutri } = await db
        .from("nutricionistas")
        .select("*")
        .eq("id_usuario", userId)
        .maybeSingle();
      if (nutri) {
        realRole = "nutricionista";
        profileData = nutri;
      }
    }

    if (realRole) {
      // Usuário encontrado! Monta o perfil e redireciona
      const completeProfile = {
        ...activeUser.user_metadata,
        ...(profileData || {}),
        role: realRole, // Garante que o role usado é o do banco
      };

      // Normaliza nomes para a interface
      completeProfile.full_name =
        profileData.nome_completo ||
        profileData.nome_loja ||
        completeProfile.full_name;

      completeProfile.phone = profileData.telefone || completeProfile.phone;

      activeUser.profile = completeProfile;
      redirectUserByRole(realRole);
    } else {
      // CASO "ZUMBI": Usuário existe no Auth, mas foi apagado do Banco.
      // Ação: Logout forçado para destravar a tela.
      console.warn("Usuário sem registro nas tabelas. Forçando logout.");
      await db.auth.signOut();
      showToast(
        "Perfil não encontrado. Faça login novamente ou registre-se.",
        "error"
      );
      showPage("login-page");
    }
  }

  db.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_IN" && session) {
      checkSession();
    } else if (event === "SIGNED_OUT") {
      activeUser = null;
      showPage("login-page");
      cart = [];
      sessionStorage.removeItem("shopping_cart");
      if (productRealtimeChannel) {
        db.removeChannel(productRealtimeChannel);
        productRealtimeChannel = null;
      }
      showToast("Você saiu.", "error");
    }
  });

  function redirectUserByRole(role) {
    if (role === "vendedor") {
      ui.userEmailSeller.textContent = `Logado como: ${activeUser.email}`;
      showPage("main-page");
      loadSellerView();
    } else if (role === "comprador") {
      ui.userEmailBuyer.textContent = `Logado como: ${activeUser.email}`;
      showPage("buyer-page");
      loadNutritionistRecommendations(activeUser.id);
      loadBuyerProducts();
      renderCart();
      listenToAllProducts();
    } else if (role === "nutricionista") {
      ui.userEmailNutritionist.textContent = `Logado como: ${activeUser.email}`;
      showPage("nutritionist-page");
      loadNutritionistView();
    } else {
      showPage("login-page");
    }
  }

  // --- VENDEDOR ---
  // --- VENDEDOR: VIEW ATUALIZADA COM ESTOQUE ---
  function loadSellerView() {
    ui.crudForm.innerHTML = `
          <input type="hidden" id="product-id" />
          <input type="hidden" id="current-image-url" />
          
          <div class="form-group-span-2">
            <label for="product-name">Nome do Produto</label>
            <input type="text" id="product-name" placeholder="Ex: Whey Protein" class="input-style" required />
          </div>
          
          <div class="form-group-span-2">
            <label for="product-description">Descrição</label>
            <textarea id="product-description" placeholder="Detalhes do produto..." rows="3" class="input-style" required></textarea>
          </div>
          
          <div class="form-grid-2">
            <div>
                <label for="product-price">Preço (R$)</label>
                <input type="number" step="0.01" id="product-price" placeholder="0.00" class="input-style" required />
            </div>
            <div>
                <label for="product-stock">Estoque (Qtd)</label>
                <input type="number" id="product-stock" placeholder="0" class="input-style" required min="0" />
            </div>
          </div>
          
          <div>
            <label for="product-category">Categoria</label>
            <input type="text" id="product-category" placeholder="proteina" class="input-style" required />
          </div>
          
          <div class="form-group-span-2" style="margin-top: 10px;">
            <label>Origem da Imagem:</label>
            <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                    <input type="radio" name="img-source" value="file" checked onchange="toggleImageInput('file')"> 
                    Enviar Arquivo
                </label>
                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer;">
                    <input type="radio" name="img-source" value="url" onchange="toggleImageInput('url')"> 
                    Link Externo
                </label>
            </div>
            <div id="container-file">
                <input type="file" id="product-image-file" accept="image/*" class="input-style" />
                <p id="image-preview-text" style="font-size: 0.8rem; color: #666; margin-top: 5px;"></p>
            </div>
            <div id="container-url" class="hidden">
                <input type="url" id="product-image-url" placeholder="https://..." class="input-style" />
            </div>
          </div>

          <div class="button-group-span-2">
            <button type="submit" id="save-btn" class="btn btn-primary">Salvar Produto</button>
            <button type="button" id="cancel-btn" class="btn btn-secondary hidden">Cancelar Edição</button>
          </div>
        `;

    window.toggleImageInput = function (mode) {
      if (mode === "file") {
        document.getElementById("container-file").classList.remove("hidden");
        document.getElementById("container-url").classList.add("hidden");
      } else {
        document.getElementById("container-file").classList.add("hidden");
        document.getElementById("container-url").classList.remove("hidden");
      }
    };

    ui.crudForm.addEventListener("submit", handleCrudSubmit);
    document
      .getElementById("cancel-btn")
      .addEventListener("click", resetCrudForm);
    ui.productList.addEventListener("click", handleProductListClick);
    loadSellerProducts();
    listenToSellerProducts();
  }

  async function loadSellerProducts() {
    if (!activeUser) return;
    const { data: products, error } = await db
      .from("products")
      .select("*")
      //.eq("user_id", activeUser.id) // Ajustar se a tabela usar id_vendedor
      .order("created_at", { ascending: false });

    // Nota: Filtro por vendedor removido temporariamente para evitar erro se coluna não existir

    if (error) {
      showToast(`Erro ao carregar produtos: ${error.message}`, "error");
      return;
    }
    ui.productList.innerHTML = "";
    if (products && products.length > 0) {
      products.forEach((product) => {
        ui.productList.appendChild(
          createSellerProductCard(product.id, product)
        );
      });
    } else {
      ui.productList.innerHTML =
        '<p class="empty-list-message">Nenhum produto cadastrado.</p>';
    }
  }

  function listenToSellerProducts() {
    if (productRealtimeChannel) {
      db.removeChannel(productRealtimeChannel);
    }
    productRealtimeChannel = db
      .channel("public:products")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        (payload) => {
          loadSellerProducts();
        }
      )
      .subscribe();
  }

  async function uploadImage(file) {
    if (!file) return null;

    // Cria um nome único para o arquivo (data + nome original limpo)
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload para o bucket 'products'
    const { data, error } = await db.storage
      .from("products")
      .upload(filePath, file);

    if (error) {
      throw new Error("Falha no upload da imagem: " + error.message);
    }

    // Pega a URL pública
    const { data: publicUrlData } = db.storage
      .from("products")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  function createSellerProductCard(id, product) {
    const card = document.createElement("div");
    card.className = "product-card";

    // Leitura corrigida
    const pName = product.name || product.nome;
    const pDesc = product.description || product.desc || product.descricao; // Tenta ler 'description' primeiro
    const pPrice = product.price || product.preco;
    const pImage = product.image_url || product.imagem_url;

    card.innerHTML = `
          <img src="${
            pImage || "https://placehold.co/600x400/f0f0f0/aaa?text=Sem+Imagem"
          }" alt="${pName}" class="product-image"
            onerror="this.onerror=null;this.src='https://placehold.co/600x400/f9fafb/1f2937?text=Imagem+Inválida';">
          <div class="product-content">
            <h3>${pName}</h3>
            <p class="product-description">${pDesc}</p>
            <p class="product-price">${formatCurrency(pPrice)}</p>
          </div>
          <div class="product-actions">
            <button data-id="${id}" class="edit-btn btn btn-edit">Editar</button>
            <button data-id="${id}" class="delete-btn btn btn-delete">Excluir</button>
          </div>`;
    return card;
  }

  async function handleCrudSubmit(e) {
    e.preventDefault();
    if (!activeUser) return;

    const saveBtn = document.getElementById("save-btn");
    const originalBtnText = saveBtn.textContent;
    saveBtn.textContent = "Salvando...";
    saveBtn.disabled = true;

    try {
      const inputMode = document.querySelector(
        'input[name="img-source"]:checked'
      ).value;
      let finalImageUrl = document.getElementById("current-image-url").value;

      if (inputMode === "file") {
        const imageFile =
          document.getElementById("product-image-file").files[0];
        if (imageFile) finalImageUrl = await uploadImage(imageFile);
      } else {
        const urlInput = document
          .getElementById("product-image-url")
          .value.trim();
        if (urlInput) finalImageUrl = urlInput;
      }

      const productData = {
        name: document.getElementById("product-name").value.trim(),
        description: document
          .getElementById("product-description")
          .value.trim(),
        price: parseFloat(document.getElementById("product-price").value),
        stock: parseInt(document.getElementById("product-stock").value) || 0, // NOVO CAMPO
        category: document
          .getElementById("product-category")
          .value.trim()
          .toLowerCase(),
        image_url: finalImageUrl,
        user_id: activeUser.id,
      };

      const productId = document.getElementById("product-id").value;
      let error;

      if (productId) {
        const { error: updateError } = await db
          .from("products")
          .update(productData)
          .eq("id", productId);
        error = updateError;
      } else {
        const { error: insertError } = await db
          .from("products")
          .insert(productData);
        error = insertError;
      }

      if (error) throw error;
      showToast(`Produto ${productId ? "atualizado" : "criado"}!`, "success");
      resetCrudForm();
      document.querySelector('input[name="img-source"][value="file"]').click();
      loadSellerProducts();
    } catch (err) {
      showToast(`Erro: ${err.message}`, "error");
    } finally {
      saveBtn.textContent = originalBtnText;
      saveBtn.disabled = false;
    }
  }

  function resetCrudForm() {
    ui.crudForm.reset();
    document.getElementById("product-id").value = "";
    document.getElementById("form-title").textContent =
      "Adicionar Novo Produto";
    document.getElementById("save-btn").textContent = "Salvar Produto";
    document.getElementById("cancel-btn").classList.add("hidden");
  }

  async function handleProductListClick(e) {
    const target = e.target.closest("button");
    if (!target) return;
    const id = target.dataset.id;
    if (!id) return;

    if (target.classList.contains("edit-btn")) {
      const { data: product, error } = await db
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        showToast("Erro ao buscar produto", "error");
        return;
      }

      if (product) {
        document.getElementById("product-id").value = product.id;
        document.getElementById("product-name").value =
          product.name || product.nome;
        document.getElementById("product-description").value =
          product.description || product.desc;
        document.getElementById("product-price").value =
          product.price || product.preco;
        document.getElementById("product-stock").value = product.stock || 0; // PREENCHE O ESTOQUE
        document.getElementById("product-category").value =
          product.category || "";

        const imgUrl = product.image_url || "";
        document.getElementById("current-image-url").value = imgUrl;
        document.getElementById("product-image-url").value = imgUrl;
        document.getElementById("image-preview-text").textContent = imgUrl
          ? "Imagem mantida."
          : "Sem imagem.";

        document.getElementById("form-title").textContent = "Editar Produto";
        document.getElementById("save-btn").textContent = "Atualizar";
        document.getElementById("cancel-btn").classList.remove("hidden");
        window.scrollTo(0, 0);
      }
    } else if (target.classList.contains("delete-btn")) {
      // ... lógica de delete (inalterada) ...
      if (confirm("Excluir produto?")) {
        await db.from("products").delete().eq("id", id);
        loadSellerProducts();
      }
    }
  }

  // --- COMPRADOR ---

  async function loadNutritionistRecommendations(buyerId) {
    ui.recommendationsList.innerHTML = "";

    // 1. Busca as recomendações no banco
    const { data: recs, error: recError } = await db
      .from("recommendations")
      .select("product_id")
      .eq("buyer_id", buyerId);

    if (recError || !recs || recs.length === 0) {
      ui.recommendationsContainer.classList.add("hidden");
      return;
    }

    // 2. Busca os produtos correspondentes
    const productIds = recs.map((r) => r.product_id);
    const { data: products, error: prodError } = await db
      .from("products")
      .select("*")
      .in("id", productIds);

    if (prodError || !products || products.length === 0) {
      ui.recommendationsContainer.classList.add("hidden");
      return;
    }

    // 3. Separa os produtos: Ativos vs Pausados (Sem Estoque)
    const available = products.filter((p) => (p.stock || 0) > 0);
    const soldOut = products.filter((p) => (p.stock || 0) <= 0);

    // 4. Renderiza os Disponíveis primeiro
    available.forEach((product) => {
      ui.recommendationsList.appendChild(
        createBuyerProductCard(product.id, product)
      );
    });

    // 5. Renderiza os Esgotados com um separador visual
    if (soldOut.length > 0) {
      const separator = document.createElement("div");
      // Ocupa toda a largura do grid para separar visualmente
      separator.style.gridColumn = "1 / -1";
      separator.innerHTML = `
        <h4 style='margin-top:20px; color:#d97706; border-top:1px solid #e5e7eb; padding-top:15px; font-weight:600;'>
            Recomendações Pausadas (Aguardando Estoque)
        </h4>`;
      ui.recommendationsList.appendChild(separator);

      soldOut.forEach((product) => {
        // Usa o card padrão de comprador, que já tem lógica visual de "esgotado"
        ui.recommendationsList.appendChild(
          createBuyerProductCard(product.id, product)
        );
      });
    }

    // Garante que o container apareça
    ui.recommendationsContainer.classList.remove("hidden");
  }

  // --- COMPRADOR: SEPARAÇÃO DE ESGOTADOS ---
  async function loadBuyerProducts() {
    const { data: products, error } = await db.from("products").select("*");

    if (error) {
      showToast("Erro ao carregar catálogo.", "error");
      return;
    }

    ui.buyerProductList.innerHTML = "";

    if (products && products.length > 0) {
      // Separa os produtos em dois arrays
      const available = products.filter((p) => (p.stock || 0) > 0);
      const soldOut = products.filter((p) => (p.stock || 0) <= 0);

      // 1. Renderiza Disponíveis
      if (available.length > 0) {
        available.forEach((product) => {
          ui.buyerProductList.appendChild(
            createBuyerProductCard(product.id, product)
          );
        });
      } else {
        ui.buyerProductList.innerHTML +=
          "<p>Sem produtos disponíveis no momento.</p>";
      }

      // 2. Renderiza Esgotados em uma "Região Separada"
      if (soldOut.length > 0) {
        // Cria um divisor visual
        const separator = document.createElement("div");
        separator.style.gridColumn = "1 / -1"; // Ocupa toda a largura do grid
        separator.style.marginTop = "2rem";
        separator.style.marginBottom = "1rem";
        separator.style.borderTop = "2px dashed #ccc";
        separator.innerHTML =
          "<h3 style='margin-top: 10px; color: #666;'>Produtos Esgotados</h3>";
        ui.buyerProductList.appendChild(separator);

        soldOut.forEach((product) => {
          ui.buyerProductList.appendChild(
            createBuyerProductCard(product.id, product)
          );
        });
      }
    } else {
      ui.buyerProductList.innerHTML =
        '<p class="empty-list-message">Nenhum produto cadastrado.</p>';
    }
  }

  function listenToAllProducts() {
    if (productRealtimeChannel) {
      db.removeChannel(productRealtimeChannel);
    }
    productRealtimeChannel = db
      .channel("public:products:all")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          loadBuyerProducts();
          if (activeUser && activeUser.user_metadata.role === "comprador") {
            loadNutritionistRecommendations(activeUser.id);
          }
        }
      )
      .subscribe();
  }

  function createBuyerProductCard(id, product) {
    const card = document.createElement("div");
    card.className = "product-card-buyer";

    const pName = product.name || product.nome;
    const pDesc = product.description || product.desc;
    const pPrice = product.price || product.preco;
    const pImage = product.image_url;
    const pStock = product.stock || 0; // Pega o estoque

    // Se estiver esgotado, aplicamos estilo visual
    if (pStock <= 0) {
      card.style.opacity = "0.7";
      card.style.filter = "grayscale(100%)";
    }

    card.innerHTML = `
          <img src="${
            pImage || "https://placehold.co/600x400?text=Sem+Imagem"
          }" class="product-image">
          <div class="product-content">
            <h3>${pName}</h3>
            <p class="product-description">${pDesc}</p>
            <div class="product-buy-row">
              <div style="display:flex; flex-direction:column;">
                <p class="product-price">${formatCurrency(pPrice)}</p>
                <small style="font-size: 0.75rem; color: #555;">Estoque: ${pStock}</small>
              </div>
              
              <button data-id="${id}" 
                      class="add-to-cart-btn btn ${
                        pStock > 0 ? "btn-primary" : "btn-secondary"
                      }"
                      ${pStock <= 0 ? "disabled" : ""}>
                ${pStock > 0 ? "Adicionar" : "Esgotado"}
              </button>
            </div>
          </div>`;

    if (pStock > 0) {
      card.querySelector(".add-to-cart-btn").addEventListener(
        "click",
        () => addToCart(id, { name: pName, price: pPrice, stock: pStock }) // Passamos o estoque para o carrinho
      );
    }

    return card;
  }

  function addToCart(productId, product) {
    const existingItem = cart.find((item) => item.id === productId);

    // Validação de Estoque ao Adicionar
    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        showToast(`Apenas ${product.stock} unidades disponíveis!`, "error");
        return;
      }
      existingItem.quantity++;
    } else {
      // Adiciona o item com a propriedade maxStock
      cart.push({
        id: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        maxStock: product.stock, // Armazena o limite no carrinho
      });
    }

    sessionStorage.setItem("shopping_cart", JSON.stringify(cart));
    renderCart();
    showToast(`${product.name} adicionado!`);
  }

  function renderCart() {
    ui.cartItems.innerHTML = "";
    if (cart.length === 0) {
      ui.cartItems.innerHTML = "<p>Seu carrinho está vazio.</p>";
      ui.checkoutBtn.disabled = true;
      ui.cartTotal.textContent = formatCurrency(0);
      return;
    }
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.quantity;
      const li = document.createElement("li");
      li.className = "cart-item";
      li.innerHTML = `
            <div>
              <span class="cart-item-name">${item.name} (x${
        item.quantity
      })</span>
              <span class="cart-item-price">${formatCurrency(
                item.price * item.quantity
              )}</span>
            </div>
            <div class="cart-item-actions">
              <button data-id="${
                item.id
              }" class="cart-adjust-btn cart-remove-one">-</button>
              <button data-id="${
                item.id
              }" class="cart-adjust-btn cart-add-one">+</button>
              <button data-id="${
                item.id
              }" class="cart-adjust-btn cart-remove-all">&times;</button>
            </div>
          `;
      ui.cartItems.appendChild(li);
    });
    ui.cartTotal.textContent = formatCurrency(total);
    ui.checkoutBtn.disabled = false;
    ui.cartItems.addEventListener("click", handleCartAdjust);
  }

  function handleCartAdjust(e) {
    const target = e.target.closest("button");
    if (!target) return;
    const id = target.dataset.id;
    const itemIndex = cart.findIndex((item) => item.id.toString() === id);
    if (itemIndex === -1) return;

    const item = cart[itemIndex];

    if (target.classList.contains("cart-add-one")) {
      // Validação de Estoque no Carrinho
      if (item.quantity + 1 > item.maxStock) {
        showToast("Limite de estoque atingido.", "error");
        return;
      }
      item.quantity++;
    } else if (target.classList.contains("cart-remove-one")) {
      item.quantity--;
      if (item.quantity <= 0) {
        cart.splice(itemIndex, 1);
      }
    } else if (target.classList.contains("cart-remove-all")) {
      cart.splice(itemIndex, 1);
    }
    sessionStorage.setItem("shopping_cart", JSON.stringify(cart));
    renderCart();
  }

  // CORREÇÃO AQUI: Ao abrir o checkout, forçamos a atualização do QR Code
  if (ui.checkoutBtn) {
    ui.checkoutBtn.addEventListener("click", () => {
      if (cart.length === 0) return;

      ui.checkoutModal.classList.remove("hidden");

      // Preenche nome se disponível
      if (activeUser && activeUser.profile) {
        const nameInput = document.getElementById("full-name");
        if (nameInput) nameInput.value = activeUser.profile.full_name || "";
      }

      // Reseta para PIX por padrão visualmente
      const pixRadio = document.querySelector(
        'input[name="payment"][value="pix"]'
      );
      if (pixRadio) pixRadio.checked = true;

      // Chama a função central que calcula totais E MOSTRA O QR CODE
      updateCheckoutSummary();
    });
  }

  if (ui.closeModalBtn) {
    ui.closeModalBtn.addEventListener("click", () =>
      ui.checkoutModal.classList.add("hidden")
    );
  }

  if (ui.calculateShippingBtn) {
    ui.calculateShippingBtn.addEventListener("click", () => {
      const cepInput = document.getElementById("cep");
      const cep = cepInput ? cepInput.value : "";

      if (cep.replace(/\D/g, "").length === 8) {
        shippingCost = 25.5;
        ui.shippingResult.innerHTML = `<span style='color:green'>Frete Fixo: ${formatCurrency(
          shippingCost
        )}</span>`;
      } else {
        shippingCost = 0;
        ui.shippingResult.innerHTML =
          "<span style='color:red'>CEP Inválido</span>";
      }

      updateCheckoutSummary(); // Recalcula e atualiza QR Code
    });
  }

  // Listener para troca de método de pagamento (Pix/Cartão)
  document
    .querySelectorAll('input[name="payment"]')
    .forEach((input) =>
      input.addEventListener("change", () => updateCheckoutSummary())
    );

  function updateCheckoutSummary() {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const total = subtotal + shippingCost;

    // Atualiza textos
    if (ui.summarySubtotal)
      ui.summarySubtotal.textContent = formatCurrency(subtotal);
    if (ui.summaryShipping)
      ui.summaryShipping.textContent = formatCurrency(shippingCost);
    if (ui.summaryTotal) ui.summaryTotal.textContent = formatCurrency(total);

    // Gera QR Code
    const paymentInput = document.querySelector(
      'input[name="payment"]:checked'
    );
    if (paymentInput) {
      displayQrCode(paymentInput.value, total);
    }
  }

  function displayQrCode(paymentMethod, totalValue) {
    if (!ui.qrCodeContainer) return;

    if (totalValue <= 0) {
      ui.qrCodeContainer.classList.add("hidden");
      return;
    }

    // Define a URL e Texto baseados no método
    const qrBase =
      "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=";
    let qrData = "";
    let text = "";

    if (paymentMethod === "pix") {
      qrData = `pix-aleatorio-${Date.now()}-${totalValue}`;
      text = "Escaneie o QR Code para pagar com Pix.";
    } else {
      qrData = `cartao-simulado-${Date.now()}-${totalValue}`;
      text = "Pagamento simulado via Cartão.";
    }

    if (ui.qrCodeImg) ui.qrCodeImg.src = qrBase + encodeURIComponent(qrData);
    if (ui.qrCodeText) ui.qrCodeText.textContent = text;

    ui.qrCodeContainer.classList.remove("hidden");
  }

  // --- NUTRICIONISTA (Adaptado) ---
  async function loadNutritionistView() {
    // REMOVIDO DAQUI: ui.patientsList.innerHTML = "";

    // Busca compradores na tabela 'compradores'
    const { data: buyers, error } = await db.from("compradores").select("*");

    if (error) {
      showToast(`Erro ao carregar pacientes: ${error.message}`, "error");
      return;
    }

    // LIMPEZA MOVIDA PARA CÁ (Só limpa quando os dados chegarem)
    ui.patientsList.innerHTML = "";

    if (buyers && buyers.length > 0) {
      buyers.forEach((buyer) => {
        const patientCard = document.createElement("div");
        patientCard.className = "patient-card";

        const bName = buyer.nome_completo || buyer.full_name;
        const bPhone = buyer.telefone || buyer.phone;

        patientCard.innerHTML = `
              <h4>${bName}</h4>
              <p>${bPhone || "Telefone não cadastrado"}</p>
            `;

        const btn = document.createElement("button");
        btn.className = "btn btn-primary";
        btn.textContent = "Ver / Recomendar";

        // Passa o objeto completo (conforme ajustamos no passo anterior)
        btn.onclick = () => showRecommendationModal(buyer);

        patientCard.appendChild(btn);
        ui.patientsList.appendChild(patientCard);
      });
    } else {
      ui.patientsList.innerHTML =
        '<p class="empty-list-message">Nenhum paciente (comprador) cadastrado.</p>';
    }
  }

  // Agora recebe o objeto 'buyer' completo
  async function showRecommendationModal(buyer) {
    // Extraímos os dados com fallback seguro
    const buyerId = buyer.id_usuario || buyer.id;
    const buyerName = buyer.nome_completo || buyer.full_name;
    const idade = buyer.idade || "N/A";
    const peso = buyer.peso ? `${buyer.peso}kg` : "N/A";
    const altura = buyer.altura ? `${buyer.altura}cm` : "N/A";

    ui.recommendationModalTitle.textContent = `Recomendar para: ${buyerName}`;

    // ATUALIZAÇÃO: Mostra os dados reais vindos do banco
    ui.patientDetails.innerHTML = `
          <div class="patient-info-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center;">
            <div style="background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <span style="display:block; font-size: 0.8em; color: #666;">Idade</span>
                <strong>${idade} anos</strong>
            </div>
            <div style="background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <span style="display:block; font-size: 0.8em; color: #666;">Peso</span>
                <strong>${peso}</strong>
            </div>
            <div style="background: #fff; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb;">
                <span style="display:block; font-size: 0.8em; color: #666;">Altura</span>
                <strong>${altura}</strong>
            </div>
          </div>
          <p style="margin-top: 10px; text-align: center; color: #666;">
             Telefone: ${buyer.telefone || "Não informado"}
          </p>
        `;

    ui.recommendationProductsList.innerHTML = "<p>Carregando produtos...</p>";
    ui.recommendationModal.classList.remove("hidden");

    // Chama a função de carregar produtos passando o ID correto
    await loadProductsForRecommendation(buyerId);
  }

  async function loadProductsForRecommendation(buyerId) {
    ui.recommendationProductsList.innerHTML = "";

    // Busca produtos e recomendações existentes
    const { data: products, error: prodError } = await db
      .from("products")
      .select("*");
    const { data: recs, error: recError } = await db
      .from("recommendations")
      .select("product_id")
      .eq("buyer_id", buyerId);

    if (prodError || !products) {
      showToast("Erro ao carregar catálogo.", "error");
      return;
    }

    // Cria um conjunto para checagem rápida
    const recommendedProductIds = new Set(
      (recs || []).map((r) => r.product_id)
    );

    if (products.length === 0) {
      ui.recommendationProductsList.innerHTML =
        "<p>Nenhum produto no catálogo.</p>";
      return;
    }

    products.forEach((product) => {
      // 1. Usa a função existente para criar o card base
      const card = createSellerProductCard(product.id, product);

      // 2. Limpa os botões de Editar/Excluir (pois estamos na visão do Nutricionista)
      const actionContainer = card.querySelector(".product-actions");
      actionContainer.innerHTML = "";

      // 3. Lógica de Estoque e Recomendação
      const isRecommended = recommendedProductIds.has(product.id);
      const stock = product.stock || 0;
      const isOutOfStock = stock <= 0;

      // 4. Aplica estilo visual se estiver Esgotado
      if (isOutOfStock) {
        card.style.border = "1px solid #fca5a5"; // Borda avermelhada
        card.style.background = "#fff1f2"; // Fundo levemente vermelho
        const title = card.querySelector("h3");
        // Adiciona badge de texto
        if (title)
          title.innerHTML +=
            " <span style='color:#dc2626; font-size:0.7em; font-weight:bold; margin-left:5px;'>(ESGOTADO)</span>";
      }

      // 5. Cria o botão de ação
      const btn = document.createElement("button");
      // Importante: Usa os nomes de dataset que suas funções handleAdd/Remove já esperam
      btn.dataset.productId = product.id;
      btn.dataset.buyerId = buyerId;
      btn.style.width = "100%";
      btn.style.marginTop = "10px";

      if (isRecommended) {
        // Se já está recomendado
        btn.className = "btn btn-delete"; // Vermelho
        // Mostra status diferente se estiver sem estoque
        btn.textContent = isOutOfStock
          ? "Pausado (Sem Estoque) - Remover"
          : "Remover Recomendação";
        btn.onclick = handleRemoveRecommendation;
      } else {
        // Se NÃO está recomendado
        if (isOutOfStock) {
          // Bloqueia a recomendação
          btn.className = "btn btn-secondary"; // Cinza
          btn.textContent = "Indisponível (Sem Estoque)";
          btn.disabled = true;
          btn.style.cursor = "not-allowed";
        } else {
          // Permite recomendar
          btn.className = "btn btn-primary"; // Azul/Verde
          btn.textContent = "Recomendar";
          btn.onclick = handleAddRecommendation;
        }
      }

      actionContainer.appendChild(btn);
      ui.recommendationProductsList.appendChild(card);
    });
  }

  async function handleAddRecommendation(e) {
    const { productId, buyerId } = e.target.dataset;
    const nutritionistId = activeUser.id;

    const { error } = await db.from("recommendations").insert({
      buyer_id: buyerId,
      product_id: productId,
      nutritionist_id: nutritionistId,
    });

    if (error) {
      showToast(`Erro ao recomendar: ${error.message}`, "error");
    } else {
      showToast("Produto recomendado!", "success");
      await loadProductsForRecommendation(buyerId);
    }
  }

  async function handleRemoveRecommendation(e) {
    const { productId, buyerId } = e.target.dataset;
    const { error } = await db
      .from("recommendations")
      .delete()
      .match({ buyer_id: buyerId, product_id: productId });

    if (error) {
      showToast(`Erro ao remover: ${error.message}`, "error");
    } else {
      showToast("Recomendação removida.", "error");
      await loadProductsForRecommendation(buyerId);
    }
  }

  // --- LISTENERS MODAIS (CORRIGIDO) ---

  if (ui.closeRecommendationModalBtn) {
    ui.closeRecommendationModalBtn.addEventListener("click", () =>
      ui.recommendationModal.classList.add("hidden")
    );
  }

  if (ui.finalizeOrderBtn) {
    ui.finalizeOrderBtn.addEventListener("click", async () => {
      // Validação simples
      const name = document.getElementById("full-name").value;
      const cpf = document.getElementById("cpf").value;
      if (!name || !cpf) {
        showToast("Preencha Nome e CPF", "error");
        return;
      }

      ui.finalizeOrderBtn.textContent = "Processando...";
      ui.finalizeOrderBtn.disabled = true;

      try {
        // Baixa estoque
        for (const item of cart) {
          // Previne erro se maxStock não estiver definido
          const currentStock = item.maxStock || item.stock || 100;
          const newStock = currentStock - item.quantity;
          await db
            .from("products")
            .update({ stock: newStock })
            .eq("id", item.id);
        }

        cart = [];
        sessionStorage.removeItem("shopping_cart");

        ui.checkoutModal.classList.add("hidden");
        renderCart();
        loadBuyerProducts(); // Atualiza tela para refletir estoque novo

        showToast("Pedido realizado com sucesso!", "success");
      } catch (err) {
        showToast("Erro ao finalizar: " + err.message, "error");
      } finally {
        ui.finalizeOrderBtn.textContent = "Finalizar Compra e Pagar";
        ui.finalizeOrderBtn.disabled = false;
      }
    });
  }

  checkSession();
});
