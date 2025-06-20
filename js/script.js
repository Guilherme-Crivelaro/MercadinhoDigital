
        let isLoggedIn = false;
        let products = [];
        let cart = [];
        let currentUser = null;


        const loginScreen = document.getElementById('loginScreen');
        const mainScreen = document.getElementById('mainScreen');
        const loginForm = document.getElementById('loginForm');
        const loading = document.getElementById('loading');
        const productsContainer = document.getElementById('productsContainer');
        const cartModal = document.getElementById('cartModal');
        const cartBtn = document.getElementById('cartBtn');
        const closeCart = document.getElementById('closeCart');
        const cartCount = document.getElementById('cartCount');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const checkoutForm = document.getElementById('checkoutForm');
        const logoutBtn = document.getElementById('logoutBtn');
        const userName = document.getElementById('userName');

       
        document.addEventListener('DOMContentLoaded', function() {
            
            const savedCart = JSON.parse(localStorage.getItem('mercadinho_cart') || '[]');
            cart = savedCart;
            updateCartCount();
            
            
            const savedUser = localStorage.getItem('mercadinho_user');
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                showMainScreen();
            }
        });

        
        loginForm.addEventListener('submit', handleLogin);
        cartBtn.addEventListener('click', openCart);
        closeCart.addEventListener('click', closeCartModal);
        logoutBtn.addEventListener('click', handleLogout);
        
        
        document.addEventListener('click', function(e) {
            console.log('Clique detectado em:', e.target.id); 
            
            if (e.target.id === 'checkoutBtn') {
                e.preventDefault();
                console.log('Abrindo checkout...'); 
                openCheckout();
            }
            
            if (e.target.id === 'backToCartBtn') {
                e.preventDefault();
                backToCart();
            }
            
            if (e.target.id === 'confirmOrderBtn') {
                e.preventDefault();
                confirmOrder();
            }
        });

        
        function handleLogin(e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (email && password) {
                currentUser = { email, name: email.split('@')[0] };
                localStorage.setItem('mercadinho_user', JSON.stringify(currentUser));
                showMainScreen();
            }
        }

        
        function handleLogout() {
            isLoggedIn = false;
            currentUser = null;
            localStorage.removeItem('mercadinho_user');
            localStorage.removeItem('mercadinho_cart');
            cart = [];
            updateCartCount();
            
            loginScreen.classList.remove('hidden');
            mainScreen.classList.add('hidden');
            checkoutForm.classList.add('hidden');
        }

  
        function showMainScreen() {
            isLoggedIn = true;
            loginScreen.classList.add('hidden');
            mainScreen.classList.remove('hidden');
            userName.textContent = `Olá, ${currentUser.name}!`;
            loadProducts();
        }

      
        async function loadProducts() {
            try {
                loading.classList.remove('hidden');
                const response = await fetch('https://fakestoreapi.com/products');
                products = await response.json();
                displayProducts();
                loading.classList.add('hidden');
                productsContainer.classList.remove('hidden');
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                loading.textContent = 'Erro ao carregar produtos. Tente novamente.';
            }
        }

 
        function displayProducts() {
            productsContainer.innerHTML = products.map(product => `
                <div class="product-card">
                    <img src="${product.image}" alt="${product.title}" class="product-image">
                    <div class="product-info">
                        <h3 class="product-title">${product.title}</h3>
                        <p class="product-description">${product.description}</p>
                        <div class="product-price">R$ ${product.price.toFixed(2).replace('.', ',')}</div>
                        <button class="btn-add-cart" onclick="addToCart(${product.id})">
                            Adicionar ao Carrinho
                        </button>
                    </div>
                </div>
            `).join('');
        }

      
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            
            updateCartCount();
            saveCart();
            
            const btn = event.target;
            const originalText = btn.textContent;
            btn.textContent = 'Adicionado!';
            btn.style.background = '#10ac84';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
            }, 1000);
        }

    
        function updateCartCount() {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
        }

     
        function saveCart() {
            localStorage.setItem('mercadinho_cart', JSON.stringify(cart));
        }

      
        function openCart() {
            displayCartItems();
            cartModal.style.display = 'block';
        }

  
        function closeCartModal() {
            cartModal.style.display = 'none';
        }

        function displayCartItems() {
            if (cart.length === 0) {
                cartItems.innerHTML = '<p style="text-align: center; color: #666;">Seu carrinho está vazio</p>';
                cartTotal.textContent = '0,00';
                checkoutBtn.style.display = 'none';
                return;
            }

            checkoutBtn.style.display = 'block';
            
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span style="margin: 0 10px;">${item.quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="quantity-btn" onclick="removeFromCart(${item.id})" style="background: #ff4757; margin-left: 10px;">×</button>
                    </div>
                </div>
            `).join('');

            updateCartTotal();
        }


        function changeQuantity(productId, change) {
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += change;
                if (item.quantity <= 0) {
                    removeFromCart(productId);
                } else {
                    updateCartCount();
                    saveCart();
                    displayCartItems();
                }
            }
        }


        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartCount();
            saveCart();
            displayCartItems();
        }

       
        function updateCartTotal() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = total.toFixed(2).replace('.', ',');
        }

      
        function openCheckout() {
            console.log('openCheckout chamado, carrinho:', cart); // Debug
            
            if (cart.length === 0) {
                alert('Seu carrinho está vazio!');
                return;
            }
            

            cartModal.style.display = 'none';
            
    
            checkoutForm.style.display = 'block';
            checkoutForm.classList.remove('hidden');
            
   
            displayOrderSummary();
            
 
            setTimeout(() => {
                checkoutForm.scrollIntoView({ behavior: 'smooth' });
            }, 100);
            
            console.log('Checkout aberto!'); 
        }


        function backToCart() {
            console.log('Voltando ao carrinho...'); 
            checkoutForm.style.display = 'none';
            checkoutForm.classList.add('hidden');
            openCart();
        }


        function displayOrderSummary() {
            const orderSummary = document.getElementById('orderSummary');
            const finalTotal = document.getElementById('finalTotal');
            
            orderSummary.innerHTML = cart.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                    <span>${item.title} (${item.quantity}x)</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
            `).join('');
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            finalTotal.textContent = total.toFixed(2).replace('.', ',');
        }


        function confirmOrder() {
            const fullName = document.getElementById('fullName').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            const city = document.getElementById('city').value;
            const cep = document.getElementById('cep').value;
            const payment = document.querySelector('input[name="payment"]:checked').value;
            
            if (!fullName || !phone || !address || !city || !cep) {
                alert('Por favor, preencha todos os campos obrigatórios.');
                return;
            }
            
            
            const orderNumber = Math.floor(Math.random() * 1000000);
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            alert(`Pedido confirmado com sucesso!\n\nNúmero do pedido: #${orderNumber}\nTotal: R$ ${total.toFixed(2).replace('.', ',')}\n\nObrigado por comprar conosco!`);
            
 
            cart = [];
            localStorage.removeItem('mercadinho_cart');
            updateCartCount();
            
            
            checkoutForm.classList.add('hidden');
            
         
            document.getElementById('fullName').value = '';
            document.getElementById('phone').value = '';
            document.getElementById('address').value = '';
            document.getElementById('city').value = '';
            document.getElementById('cep').value = '';
        }

       
        cartModal.addEventListener('click', function(e) {
            if (e.target === cartModal) {
                closeCartModal();
            }
        });
