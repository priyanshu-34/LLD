//Problem Statement: Implement the Decorator Pattern in TypeScript to enhance the functionality of a basic pizza order system. User can order a basic pizza and then add various toppings (like cheese, pepperoni, mushrooms) to it. Each topping should enhance the pizza's description and cost.

//How to do it without decorator pattern: we will have a base pizza class and then create subclasses for each type of pizza with different toppings. This approach can lead to a large number of subclasses and is not flexible for adding new toppings in the future.

class _Pizza {
    description: string;
    cost: number;

    constructor() {
        this.description = "Basic Pizza";
        this.cost = 5; // base cost of pizza
    }

    getDescription(): string {
        return this.description;
    }

    getCost(): number {
        return this.cost;
    }
}

class PizzaWithCheese extends _Pizza {
    constructor() {
        super();
        this.description += ", Cheese";
        this.cost += 2; // cost of cheese topping
    }
}

class PizzaWithPepperoni extends _Pizza {
    constructor() {
        super();
        this.description += ", Pepperoni";
        this.cost += 3; // cost of pepperoni topping
    }
}

class PizzaWithMushrooms extends _Pizza {
    constructor() {
        super();
        this.description += ", Mushrooms";
        this.cost += 1.5; // cost of mushrooms topping
    }
}

// Example usage:
const basicPizza = new _Pizza();
console.log(basicPizza.getDescription()); // Output: Basic Pizza
console.log(basicPizza.getCost()); // Output: 5




// Now, let's implement the Decorator Pattern to enhance the pizza order system.
// The Decorator Pattern allows us to add new functionality to an object dynamically without altering its structure. We will create a base pizza class and then create decorator classes for each topping.


interface PizzaComponent {
    getDescription(): string;
    getCost(): number;
}

// Base Pizza class
class BasicPizza implements PizzaComponent {
    description: string;
    cost: number;

    constructor() {
        this.description = "Basic Pizza";
        this.cost = 5; // base cost of pizza
    }

    getDescription(): string {
        return this.description;
    }

    getCost(): number {
        return this.cost;
    }
}


// Decorator class
abstract class PizzaDecorator implements PizzaComponent {
    protected pizza: PizzaComponent;

    constructor(pizza: PizzaComponent) {
        this.pizza = pizza;
    }

    abstract getDescription(): string;
    abstract getCost(): number;
}

// Concrete Decorators
class CheeseDecorator extends PizzaDecorator {
    constructor(pizza: PizzaComponent) {
        super(pizza);
    }

    getDescription(): string {
        return this.pizza.getDescription() + ", Cheese";
    }

    getCost(): number {
        return this.pizza.getCost() + 2; // cost of cheese topping
    }
}

class PepperoniDecorator extends PizzaDecorator {
    constructor(pizza: PizzaComponent) {
        super(pizza);
    }

    getDescription(): string {
        return this.pizza.getDescription() + ", Pepperoni";
    }

    getCost(): number {
        return this.pizza.getCost() + 3; // cost of pepperoni topping
    }
}

// Example usage of Decorator Pattern
const basicPizzaWithCheese = new CheeseDecorator(new BasicPizza());
console.log(basicPizzaWithCheese.getDescription()); // Output: Basic Pizza, Cheese
console.log(basicPizzaWithCheese.getCost()); // Output: 7

const basicPizzaWithCheeseAndPepperoni = new PepperoniDecorator(basicPizzaWithCheese);
console.log(basicPizzaWithCheeseAndPepperoni.getDescription()); // Output: Basic Pizza, Cheese, Pepperoni
console.log(basicPizzaWithCheeseAndPepperoni.getCost()); // Output: 10
