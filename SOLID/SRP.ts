
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

    generateInvoice(): string {
        let invoice = 'Invoice:\n';
        this.products.forEach(product => {
            invoice += `${product.getName()}: $${product.getPrice()}\n`;
        });
        invoice += `Total: $${this.getTotalPrice()}`;
        return invoice;
    }
}


function main() {
    const cart = new ShoppingCart();
    cart.addProduct(new Product('Laptop', 1000));
    cart.addProduct(new Product('Mouse', 50));

    console.log(cart.generateInvoice());
}



//The above code violates the Single Responsibility Principle (SRP) because the ShoppingCart class has two responsibilities: managing the products in the cart and generating an invoice. To adhere to SRP, we can refactor the code by separating the invoice generation into its own class.


class ShoppingCartSRP{
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
    constructor(private cart: ShoppingCartSRP) { }
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

function mainSRP() {
    const cart = new ShoppingCartSRP();
    cart.addProduct(new Product('Laptop', 1000));
    cart.addProduct(new Product('Mouse', 50));

    const invoiceGenerator = new InvoiceGenerator(cart);
    console.log(invoiceGenerator.generateInvoice());
}

mainSRP();