/*
=====================================================
OPEN/CLOSED PRINCIPLE (OCP)
=====================================================
In simple words:
  Code should be OPEN for adding new behavior, but CLOSED
  for editing what's already there and working.

  In other words: when you need to support something new,
  you should be able to add new code for it, instead of
  going back and changing an existing class that already
  works (and might already be used elsewhere).

Why this matters:
  Every time you edit a class that already works, you risk
  breaking something that depends on it. If instead you can
  just "plug in" new behavior without touching old code,
  there's nothing old to accidentally break.
=====================================================
*/


/* -----------------------------------------------------
   ❌ THE PROBLEM (wrong way of doing it)
   -----------------------------------------------------
   PaymentProcessor decides what to do based on a string
   (paymentMethod) using if/else.

   The problem: every time we want to support a NEW payment
   method (say, UPI or Stripe), we have to open this class
   again and add another "else if" branch.

   That means:
   - We keep editing a class that already works, risking bugs
     in the payment methods that were working fine before.
   - The class keeps growing forever and never feels "done".
----------------------------------------------------- */

class PaymentProcessor {
    processPayment(paymentMethod: string, amount: number): void {
        if (paymentMethod === 'creditCard') {
            console.log(`Processing credit card payment of $${amount}`);
        } else if (paymentMethod === 'paypal') {
            console.log(`Processing PayPal payment of $${amount}`);
        } else {
            // adding UPI, Stripe, etc. later means coming back
            // and editing this exact function again and again
            throw new Error('Unsupported payment method');
        }
    }
}

function ocpBadExample() {
    const processor = new PaymentProcessor();
    processor.processPayment('creditCard', 40);
    processor.processPayment('paypal', 40);
}

// ocpBadExample();


/* -----------------------------------------------------
   ✅ THE FIX
   -----------------------------------------------------
   Instead of one class that "knows" every payment method
   by name, we define a common shape (interface) that says
   "any payment processor must have a processPayment method".

   Each payment method then becomes its OWN small class that
   implements this shape. Want to support a new payment
   method tomorrow? Just add a new class for it — no existing
   class needs to be opened or edited.
----------------------------------------------------- */

interface PaymentProcessorInterface {
    processPayment(amount: number): void;
}

class StripePaymentProcessor implements PaymentProcessorInterface {
    processPayment(amount: number): void {
        console.log(`Processing Stripe Payment of $${amount}`);
    }
}

class UPIPaymentProcessor implements PaymentProcessorInterface {
    processPayment(amount: number): void {
        console.log(`Processing UPI Payment of $${amount}`);
    }
}

// Later, supporting PayPal is just a new class — nothing above changes:
// class PayPalPaymentProcessor implements PaymentProcessorInterface { ... }

function ocpGoodExample() {
    const stripePaymentProcessor = new StripePaymentProcessor();
    stripePaymentProcessor.processPayment(40);

    const upiPaymentProcessor = new UPIPaymentProcessor();
    upiPaymentProcessor.processPayment(40);
}

ocpGoodExample();


/* -----------------------------------------------------
   TL;DR — the one thing to remember
   -----------------------------------------------------
   - Bad sign: adding new behavior means going back into an
     existing, working class and adding another if/else branch.
   - Good fix: define a common interface, and add new behavior
     as a brand-new class that implements it — old code stays untouched.
----------------------------------------------------- */
