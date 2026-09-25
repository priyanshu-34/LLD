/*
=====================================================
SINGLE RESPONSIBILITY PRINCIPLE (SRP)
=====================================================
In simple words:
  A class should have only ONE job / ONE reason to change.

  If you can describe a class using "and" — like
  "this class stores cart items AND builds invoices" —
  that's usually a sign it's doing too much and should be
  split into two classes.

Why this matters:
  When one class handles multiple jobs, a change needed for
  one job (say, how invoices look) forces you to touch a
  class that also handles something unrelated (cart items).
  That makes the code riskier to change and harder to test.
=====================================================
*/


/* -----------------------------------------------------
   ❌ THE PROBLEM (wrong way of doing it)
   -----------------------------------------------------
   ShoppingCart below does two different jobs:
   1. Keeps track of products in the cart (add, list, total).
   2. Builds a printable invoice from those products.

   These are two separate reasons to change this class —
   if the invoice format changes, or the cart logic changes,
   both changes land in the same file, tangled together.
----------------------------------------------------- */

class Product {
    private name: string;
    private price: number;

    constructor(name: string, price: number) {
        this.name = name;
        this.price = price;
    }

    getName(): string {
        return this.name;
    }

    getPrice(): number {
        return this.price;
    }
}

class ShoppingCart {
    private products: Product[] = [];

    addProduct(product: Product): void {
        this.products.push(product);
    }

    getProducts(): Product[] {
        return this.products;
    }

    getTotalPrice(): number {
        return this.products.reduce((total, product) => total + product.getPrice(), 0);
    }

    // job #2 hiding inside a "cart" class — this shouldn't be here
    generateInvoice(): string {
        let invoice = 'Invoice:\n';
        this.products.forEach(product => {
            invoice += `${product.getName()}: $${product.getPrice()}\n`;
        });
        invoice += `Total: $${this.getTotalPrice()}`;
        return invoice;
    }
}

function srpBadExample() {
    const cart = new ShoppingCart();
    cart.addProduct(new Product('Laptop', 1000));
    cart.addProduct(new Product('Mouse', 50));

    console.log(cart.generateInvoice());
}

// srpBadExample();


/* -----------------------------------------------------
   ✅ THE FIX
   -----------------------------------------------------
   Split the two jobs into two classes, each with exactly
   one reason to change:

   - ShoppingCartSRP   → only manages products (add, list, total).
   - InvoiceGenerator  → only knows how to turn a cart's
                          products into an invoice.

   Now if the invoice format changes, you only touch
   InvoiceGenerator. If how the cart stores items changes,
   you only touch ShoppingCartSRP. Neither affects the other.
----------------------------------------------------- */

class ShoppingCartSRP {
    private products: Product[] = [];

    addProduct(product: Product): void {
        this.products.push(product);
    }

    getProducts(): Product[] {
        return this.products;
    }

    getTotalPrice(): number {
        return this.products.reduce((total, product) => total + product.getPrice(), 0);
    }
}

class InvoiceGenerator {
    constructor(private cart: ShoppingCartSRP) {}

    generateInvoice() {
        const products: Product[] = this.cart.getProducts();
        let invoice = 'Invoice:\n';
        products.forEach(product => {
            invoice += `${product.getName()}: $${product.getPrice()}\n`;
        });
        invoice += `Total: $${this.cart.getTotalPrice()}`;
        return invoice;
    }
}

function srpGoodExample() {
    const cart = new ShoppingCartSRP();
    cart.addProduct(new Product('Laptop', 1000));
    cart.addProduct(new Product('Mouse', 50));

    const invoiceGenerator = new InvoiceGenerator(cart);
    console.log(invoiceGenerator.generateInvoice());
}

srpGoodExample();


/* -----------------------------------------------------
   TL;DR — the one thing to remember
   -----------------------------------------------------
   - Bad sign: a class's description needs the word "and"
     to cover everything it does.
   - Good fix: pull each separate job into its own class,
     so each class changes for only one reason.
----------------------------------------------------- */
