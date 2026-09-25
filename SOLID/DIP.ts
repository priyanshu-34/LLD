/*
=====================================================
DEPENDENCY INVERSION PRINCIPLE (DIP)
=====================================================
In simple words:
  A high-level class (the one that contains the main
  business logic) should not directly depend on a
  low-level class (the one that does the actual grunt
  work, like sending an email). Both should depend on
  an interface (an abstraction) in between them.

Why this matters:
  If EmailClient directly creates and calls Gmail, then
  EmailClient is "locked in" to Gmail. The day we need to
  switch to Outlook (or support both), we're forced to go
  back and edit EmailClient itself — risky, and it breaks
  the Open/Closed Principle too.

  If EmailClient instead only knows about an interface
  ("something that can send a message"), we can hand it
  ANY class that implements that interface — Gmail, Outlook,
  or a new provider next year — without changing EmailClient at all.
=====================================================
*/


/* -----------------------------------------------------
   ❌ THE PROBLEM (wrong way of doing it)
   -----------------------------------------------------
   EmailClient directly creates/depends on the concrete
   Gmail class. It's not talking to "an email sender" in
   general, it's talking to Gmail specifically.

   If we want to switch to Outlook tomorrow, we have no
   choice but to open up EmailClient and rewrite it.
----------------------------------------------------- */

class GmailClient {
    send() {
        console.log("Sending email via Gmail");
    }
}

class EmailClientTightlyCoupled {
    constructor(private gmail: GmailClient) {}

    sendEmail() {
        this.gmail.send();
    }
}

function dipBadExample() {
    const client = new EmailClientTightlyCoupled(new GmailClient());
    client.sendEmail();
}

// dipBadExample();


/* -----------------------------------------------------
   ✅ THE FIX
   -----------------------------------------------------
   We introduce an interface — EmailInterface — that just
   says "anything that can send(message) counts as an email
   sender". Gmail and Outlook both implement this interface.

   EmailClient (the high-level class) now only depends on
   EmailInterface, not on Gmail or Outlook directly. We can
   hand it whichever one we want from the outside — this is
   called "dependency injection", the dependency (Gmail /
   Outlook) is passed in, not created inside EmailClient.
----------------------------------------------------- */

interface EmailInterface {
    send(message: string): void;
}

class Gmail implements EmailInterface {
    send(message: string) {
        console.log("Sending email via Gmail: " + message);
    }
}

class Outlook implements EmailInterface {
    send(message: string) {
        console.log("Sending email via Outlook: " + message);
    }
}

class EmailClient {
    constructor(private email: EmailInterface) {}

    sendEmail(message: string) {
        this.email.send(message);
    }
}

function dipGoodExample() {
    // EmailClient doesn't care which one this is, it only
    // knows it can call send() on it — that's the whole point
    const gmailClient = new EmailClient(new Gmail());
    gmailClient.sendEmail("Hello, this is Gmail");

    const outlookClient = new EmailClient(new Outlook());
    outlookClient.sendEmail("Hello, this is Outlook");
}

dipGoodExample();


/* -----------------------------------------------------
   TL;DR — the one thing to remember
   -----------------------------------------------------
   - Bad sign: a high-level class creates/depends on a
     specific low-level class directly (new Gmail() inside it).
   - Good fix: both sides depend on a shared interface, and
     the actual low-level class is passed in from outside.
----------------------------------------------------- */
