/* Open/Closed Principle (OCP). This principle states that software entities like classes, functions
should not be modified for new functionality; instead, they should be extended. For example, if we want to add a new payment method, we should extend the PaymentProcessor class rather than modifying it. */


//Here is the example where we will break the OCP principle. We have a PaymentProcessor class that processes payments. If we want to add a new payment method, we will have to modify the existing class, which violates the OCP principle.

//Here we have to write ifelse logic everytime we need to add any new payment method. This can introduce bugs and not scalable

class PaymentProcessor {
    processPayment(paymentMethod: string, amount: number): void{
        if (paymentMethod === 'creditCard') {
            console.log(`Processing credit card payment of $${amount}`);
        } else if (paymentMethod === 'paypal') {
            console.log(`Processing PayPal payment of $${amount}`);
        } else {
            throw new Error('Unsupported payment method');
        }
    }
}


// We can achieve OCP by the help of abstractons. We will have an interface with a processPayment method.. Now the interface does not define the implementation.. So we can implements the interface in any class . For example.. if we want to have a stripe payment method, we can create a class StripePaymentProcessor implements <interface> and inside that we will have to define the function which is defined in the interface.. Now in that function, we can have Stripe payment logics

interface PaymentProcessorInterface{
    processPayment(amount: number): void;
}

class StripePaymentProcessor implements PaymentProcessorInterface{

    processPayment(amount: number): void {
        console.log(`Processing Stripe Payment of $${amount}`);
    }
}

class UPIPaymentProcessor implements PaymentProcessorInterface {

    processPayment(amount: number): void {
        console.log(`Processing UPI Payment of $${amount}`);
    }
}

function main() {
    const stripePaymentProcessor = new StripePaymentProcessor();
    stripePaymentProcessor.processPayment(40);
}
main()

