//Now user is able to add items to the cart... But he cannot order.. So in phase 2 , we will handle order related things

class Menu {
    constructor(private id: number, private name: string, private price: number) { }
    getMenu() {
        return {
            id: this.id,
            name: this.name,
            price: this.price
        }
    }
    setMenu(name: string, price: number | null) {
        this.name = name;
        if (price) this.price = price
    }
}

class Restaurent {
    private menuItems: Menu[] = [];
    constructor(private id: number, private name: string, private location: string) { }
    getRestaurant() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            menu: this.menuItems
        }
    }
    addMenu(id: number, name: string, price: number) {
        this.menuItems.push(new Menu(id, name, price))
    }
    getMenuItem(id: number) {
        return this.menuItems.find((item: Menu) => {
            return item.getMenu().id === id;
        })
    }

}

class RestaurentManager {
    private restaurents: Restaurent[] = [];
    constructor() { }

    addRestaurent(id: number, name: string, location: string) {
        const rest = new Restaurent(id, name, location)
        this.restaurents.push(rest)
        return rest;
    }

    search(location: string) {
        const restaurent: (Restaurent | undefined) = this.restaurents.find((res: Restaurent) => {
            return res.getRestaurant().location === location
        })
        return restaurent;
    }
}

class Cart {
    private menuItems: Menu[] = []
    private restaurent: Restaurent | undefined = undefined
    constructor() { }
    addItem(menuItem: Menu, restaurent: Restaurent) {
        if (this.restaurent != undefined && this.restaurent != restaurent) {
            this.menuItems = [];
        }
        this.restaurent = restaurent
        this.menuItems.push(menuItem)
        console.log("Item Added to the cart")
    }
    getItems() {
        return {
            restaurent: this.restaurent,
            items: this.menuItems
        }
    }
    calculatePrice() {
        let totalPrice = 0;
        for (let i = 0; i < this.menuItems.length; i++) {
            totalPrice += this.menuItems[i].getMenu().price
        }
        console.log("Total price of the cart: ", totalPrice)
        return totalPrice;
    }
    clearCart() {
        this.restaurent = undefined;
        this.menuItems = [];
        console.log("Cart Cleared")
    }
}

interface Payable{
    pay(amount:number): void;
}
class Upi implements Payable{
    pay(amount: number) {
        console.log("Payment successful via UPI: ", amount)
    }
}
class CreditCard implements Payable{
    pay(amount:number): void {
        console.log("Payment successull via Credit Card: ", amount);
    }
}

class PaymentGateway{
    initiatePayment(paymentMethod: Payable, amount: number) {
        paymentMethod.pay(amount);
    }
}

class Order{
    private static nextId = 1;
    private orderId = Order.nextId++;

    constructor(
        private restaurent: string,
        private items: { id: number, name: string, price: number }[],
        private status: "Success" | "Pending" | "Failed",
        private totalPrice: number
    ) { }


    getOrder() {
        return {
            orderId: this.orderId,
            restaurent: this.restaurent,
            items: this.items,
            status: this.status,
            totalPrice: this.totalPrice
        }
    }
    updatePaymentStatus(status: "Success" | "Pending" | "Failed") {
        this.status = status;
        console.log("Payment Status updated to : ", status)
    }

}

class User {
    private cart: Cart;
    private orders: Order[] = [];
    constructor(private id: number, private name: string) {
        this.cart = new Cart()
    }

    getCartItems() {
        return this.cart.getItems()
    }
    addItemToTheCart(item: Menu, restaurent: Restaurent) {
        this.cart.addItem(item, restaurent)
    }

    checkout(payment: Payable) {
        const { restaurent, items: cartItems } = this.cart.getItems();

        if (!restaurent || cartItems.length === 0) {
            throw Error("No items in the cart")
        }

        const totalPrice = this.cart.calculatePrice();
        const newOrder = new Order(
            restaurent.getRestaurant().name,
            cartItems.map(m => m.getMenu()),
            "Pending",
            totalPrice
        )
        this.orders.push(newOrder);
        //initiate Payment:
        const paymentGateway = new PaymentGateway();
        paymentGateway.initiatePayment(payment, totalPrice);
        newOrder.updatePaymentStatus("Success")

        //clear cart
        this.cart.clearCart()
        console.log("Checkout Done")
        return newOrder;
        //TODO: we will handle the payment later

    }

    getOrders() {
        return this.orders.map(o => o.getOrder());
    }


}


function initialize() {
    const manager = new RestaurentManager();
    const rest1 = manager.addRestaurent(1, "rest1", 'bettiah')
    const rest2 = manager.addRestaurent(2, "rest2", 'semra')
    const rest3 = manager.addRestaurent(3, "rest3", 'motihari')
    const rest4 = manager.addRestaurent(4, "rest4", 'patna')

    rest1.addMenu(8, "rest1-menu1", 120);
    rest1.addMenu(7, "rest1-menu2", 100);
    rest1.addMenu(6, "rest1-menu3", 20);
    rest1.addMenu(5, "rest1-menu4", 190);

    rest2.addMenu(1, "rest2-menu1", 120);
    rest2.addMenu(2, "rest2-menu2", 100);
    rest2.addMenu(3, "rest2-menu3", 20);
    rest3.addMenu(4, "rest3-menu1", 190);
    return manager
}


function client() {
    //creates user:
    const user1 = new User(1, "Priyanshu");

    const manager = initialize();

    const restaurent = manager.search("bettiah")
    // console.log(restaurent)
    const menuToBeAdded = restaurent?.getMenuItem(8);
    // console.log(menuToBeAdded)
    if (restaurent && menuToBeAdded) {
        user1.addItemToTheCart(menuToBeAdded, restaurent);
        user1.checkout(new Upi());

        console.log(JSON.stringify(user1.getOrders(), null, 2));
    }
}

client();