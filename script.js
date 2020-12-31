

// all vars:
const cartBtn = document.querySelector('.cart-btn'); // in navbar
const cartItems = document.querySelector('.cart-items'); // in navbar
const productsDOM = document.querySelector('.products-center');
// cart section - all:
const cartOverlay = document.querySelector('.cart-overlay');
const cartDOM = document.querySelector('.cart');
const cartContent = document.querySelector('.cart-content');
const cartTotal = document.querySelector('.cart-total');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');


// Cart items:
let cart = [];
// All Buttons:
let buttonsDOM = [];

// getting the products:
class Products {
	async getProducts () {
		try {
			
			let result = await fetch('products.json');
			let data = await result.json();
			let products = data.items;
	

			products = products.map((item) => {
				const { title, price } = item.fields;
				const { id } = item.sys;
				const image = item.fields.image.fields.file.url;
				return { title, price, id, image };
			});
			return products;
		} catch (error) {
			console.log(error);
		}
	}
}

// display products:
class UI {
	displayProducts (products) {
		// console.log(products);
		let result = '';
		products.forEach((product) => {
			result += `
                <!-- single product -->
                <article class="product">
                    <div class="img-container">
                        <img src=${product.image} alt="product" class="product-img">
                        <button class="bag-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart"></i> add to cart
                        </button>
                    </div>
                    <h3>${product.title}</h3>
                    <h4>$${product.price}</h4>
                </article>
                <!-- single product article ends -->
                `;
		});
		return (productsDOM.innerHTML = result);
		// productsDOM.innerHTML = result;
	}
	getBagButtons () {
		const buttons = [ ...document.querySelectorAll('.bag-btn') ]; // So it'll give us an array instead of Node list.
		buttonsDOM = buttons;
		buttons.forEach((button) => {
			let id = button.dataset.id;
			let inCart = cart.find((item) => id === item.id);
			if (inCart) {
				button.innerText = 'In Cart';
				button.disabled = true;
			}
			button.addEventListener('click', (event) => {
				event.target.innerText = 'In Cart';
				event.target.disabled = true;
				// get product from products based on the id we're getting:
				let cartItem = { ...Storage.getProduct(id), count: 1 };
				// add product to the cart:
				cart = [ ...cart, cartItem ];
				// save cart in local storage:
				Storage.saveCart(cart);
				// set cart values:
				this.setCartValues(cart);
				// add and display cart item:
				this.addCartItem(cartItem);
				// show the cart:
				this.showCart();
			});
		});
	}
	setCartValues (cart) {
		let startingPriceTotal = 0;
		let itemsCountTotal = 0;
		cart.map((item) => {
			startingPriceTotal += item.count * item.price;
			itemsCountTotal += item.count;
		});
		cartTotal.innerText = parseFloat(startingPriceTotal.toFixed(2));
		cartItems.innerText = itemsCountTotal;
		
	}
	addCartItem (item) {
		const div = document.createElement('div');
		div.classList.add('cart-item');
		div.innerHTML = `
			<img src=${item.image} alt="product item">
             <div>
                 <h4>${item.title}</h4>
                 <h5>$${item.price}</h5>
                 <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
                   <i class="fas fa-chevron-up" data-id=${item.id}></i>
                  <p class="item-amount">${item.count}</p>
                  <i class="fas fa-chevron-down" data-id=${item.id}></i>
			</div>
			`;
		cartContent.appendChild(div);
		
	}
	showCart () {
		cartOverlay.classList.add('transparentBcg');
		cartDOM.classList.add('showCart');
	}
	setupWholeWeb () {
		cart = Storage.getCart();
		this.setCartValues(cart);
		this.populateCart(cart);
		cartBtn.addEventListener('click', this.showCart);
		closeCartBtn.addEventListener('click', this.hideCart);
	}
	populateCart (cart) {
		cart.forEach((item) => this.addCartItem(item));
	}
	hideCart () {
		cartOverlay.classList.remove('transparentBcg');
		cartDOM.classList.remove('showCart');
	}
	cartLogic () {
		// clear cart button:
		clearCartBtn.addEventListener('click', () => this.clearCartMethod());
		// cart functionality:
		cartContent.addEventListener('click', (event) => {
			if (event.target.classList.contains('remove-item')) {
				let removeItem = event.target;
				let id = removeItem.dataset.id;
				cartContent.removeChild(removeItem.parentElement.parentElement);
				this.removeItem(id);
			} else if (event.target.classList.contains('fa-chevron-up')) {
				let addCount = event.target;
				let id = addCount.dataset.id;
				let temporaryItemInCart = cart.find((item) => item.id === id);
				temporaryItemInCart.count = temporaryItemInCart.count + 1;
				Storage.saveCart(cart);
				this.setCartValues(cart);
				addCount.nextElementSibling.innerText = temporaryItemInCart.count;
			} else if (event.target.classList.contains('fa-chevron-down')) {
				let lowerCount = event.target;
				let id = lowerCount.dataset.id;
				let temporaryItemInCart = cart.find((item) => item.id === id);
				temporaryItemInCart.count = temporaryItemInCart.count - 1;
				if (temporaryItemInCart.count > 0) {
					Storage.saveCart(cart);
					this.setCartValues(cart);
					lowerCount.previousElementSibling.innerText = temporaryItemInCart.count;
				} else {
					cartContent.removeChild(lowerCount.parentElement.parentElement);
					this.removeItem(id);
				}
			}
		});
	}
	clearCartMethod () {
		// console.log(this);
		let cartItems = cart.map((item) => item.id);
		// console.log(cartItems);
		cartItems.forEach((id) => this.removeItem(id));
		// console.log(cartContent.children);

		while (cartContent.children.length > 0) {
			cartContent.removeChild(cartContent.children[0]);
		}
		this.hideCart();
	}
	removeItem (id) {
		cart = cart.filter((item) => id !== item.id);
		this.setCartValues(cart);
		Storage.saveCart(cart);
		let button = this.getSingleBtn(id);
		button.disabled = false;
		button.innerHTML = `<i class="fas fa-shopping-cart"></i> add to cart`;
	}
	getSingleBtn (id) {
		return buttonsDOM.find((button) => button.dataset.id === id);
	}
}

// local storage:
class Storage {
	static saveProducts (products) {
		localStorage.setItem('products', JSON.stringify(products));
	}
	static getProduct (id) {
		let products = JSON.parse(localStorage.getItem('products'));
		return products.find((product) => id === product.id);
	}
	static saveCart (cart) {
		localStorage.setItem('cart', JSON.stringify(cart));
	}
	static getCart () {
		return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) :
			[];
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const ui = new UI();
	const products = new Products();

	// setup Whole Web:
	ui.setupWholeWeb();
	ui.cartLogic();

	// get ALL products
	products
		.getProducts()
		.then((products) => {
			ui.displayProducts(products);
			Storage.saveProducts(products);
		})
		.then(() => {
			ui.getBagButtons();
		});
});
