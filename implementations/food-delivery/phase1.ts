// class Menu{
//     constructor(private id: number, private name: string, private price: number) { }
//     getMenu() {
//         return {
//             id: this.id,
//             name: this.name,
//             price: this.price
//         }
//     }
//     setMenu(name: string, price: number  | null) {
//         this.name = name;
//         if(price) this.price = price
//     }
// }

// class Restaurent{
//     private menuItems: Menu[] = [];
//     constructor(private id: number, private name: string, private location: string) { }
//     getRestaurant() {
//         return {
//             id: this.id,
//             name: this.name,
//             location: this.location,
//             menu: this.menuItems
//         }
//     }
//     addMenu(id:number, name: string, price: number) {
//         this.menuItems.push(new Menu(id, name, price))
//     }
//     getMenuItem(id: number) {
//         return this.menuItems.find((item: Menu) => {
//             return item.getMenu().id === id;
//         })
//     }

// }

// class RestaurentManager{
//     private restaurents: Restaurent[] = [];
//     constructor() { }
    
//     addRestaurent(id: number, name: string, location: string) {
//         const rest = new Restaurent(id, name, location)
//         this.restaurents.push(rest)
//         return rest;
//     }
    
//     search(location: string) {
//         const restaurent: (Restaurent | undefined ) = this.restaurents.find((res: Restaurent) => {
//             return res.getRestaurant().location === location
//         })
//         return restaurent;
//     }
// }

// class Cart{
//     private menuItems: Menu[] = []
//     private restaurent: Restaurent | undefined = undefined
//     constructor() { }
//     addItem(menuItem: Menu, restaurent: Restaurent) {
//         if (this.restaurent != undefined && this.restaurent != restaurent) {
//             this.menuItems = [];
//         }
//         this.restaurent = restaurent
//         this.menuItems.push(menuItem)
//     }
//     getItems() {
//         return {
//            restaurent:  this.restaurent,
//             items: this.menuItems
//         }
//     }
//     calculatePrice() {
//         let totalPrice = 0;
//         for (let i = 0; i < this.menuItems.length; i++){
//             totalPrice += this.menuItems[i].getMenu().price
//         }
//         return totalPrice;
//     }
//     //removeItem - > later phase 
// }

// class User{
//     private cart: Cart;
//     constructor(private id: number, private name: string) {
//         this.cart = new Cart()
//     }

//     getCartItems() {
//         return this.cart.getItems()
//     }
//     addItemToTheCart(item: Menu, restaurent: Restaurent) {
//         this.cart.addItem(item, restaurent)
//     }

// }

// function initialize() {
//     const manager = new RestaurentManager();
//     const rest1 = manager.addRestaurent(1, "rest1", 'bettiah')
//     const rest2 = manager.addRestaurent(2, "rest2", 'semra')
//     const rest3 = manager.addRestaurent(3, "rest3", 'motihari')
//     const rest4 = manager.addRestaurent(4, "rest4", 'patna')

//     rest1.addMenu(8, "rest1-menu1", 120);
//     rest1.addMenu(7, "rest1-menu2", 100);
//     rest1.addMenu(6, "rest1-menu3", 20);
//     rest1.addMenu(5, "rest1-menu4", 190);

//     rest2.addMenu(1, "rest2-menu1", 120);
//     rest2.addMenu(2, "rest2-menu2", 100);
//     rest2.addMenu(3, "rest2-menu3", 20);
//     rest3.addMenu(4, "rest3-menu1", 190);
//     return manager
// }


// function client(){
//     //creates user:
//     const user1 = new User(1, "Priyanshu");

//     const manager = initialize();

//     const restaurent = manager.search("bettiah")
//     // console.log(restaurent)
//     const menuToBeAdded = restaurent?.getMenuItem(8);
//     // console.log(menuToBeAdded)
//     if(restaurent && menuToBeAdded){
//         user1.addItemToTheCart(menuToBeAdded, restaurent);
//     }

//     const r2 = manager.search("semra");
//     const m2 = r2?.getMenuItem(1);
//     if (r2 && m2) user1.addItemToTheCart(m2, r2);
//     console.log(user1.getCartItems()); // should show only rest2 + 1 item


// }

// client();