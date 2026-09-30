/**
 * ============================================================================
 *  FACTORY PATTERN — second use case: NOTIFICATIONS
 * ============================================================================
 *
 *  Same 6 stages as factoryPattern.ts, new domain: sending a message to a
 *  user over Email, SMS, or Push. Read this after factoryPattern.ts and check
 *  that each stage fixes the same pain in a different setting.
 *
 *    Stage 0  No factory                -> every caller does `new`
 *    Stage 1  Simple Factory            -> creation moves to one function
 *    Stage 2  Config-driven factory     -> credentials leave the caller
 *    Stage 3  Registry                  -> add channels without editing it
 *    Stage 4  Abstract Factory          -> sender + formatter can't mismatch
 *    Stage 5  Factory Method (GoF)      -> subclass decides what to build
 *
 *  Run it:         npx tsx factoryPattern2.ts
 *  Type-check it:  npx tsc --noEmit --strict factoryPattern2.ts
 * ============================================================================
 */


/* ============================================================================
 * STAGE 0 — NO FACTORY (the problem)
 * ============================================================================
 * Every place that notifies a user (signup, password reset, order shipped...)
 * builds the sender itself, so every place must know:
 *   1. which channel is active, and
 *   2. what each channel's constructor needs.
 */
namespace Stage0_NoFactory {

    export interface Notifier {
        send(to: string, message: string): void;
    }

    export class EmailNotifier implements Notifier {
        // Constructors DON'T MATCH. Email needs an SMTP server...
        constructor(
            private smtpHost: string,
            private port: number,
            private fromAddress: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  Email via ${this.smtpHost}:${this.port} from ${this.fromAddress} to ${to}: ${message}`);
        }
    }

    export class SmsNotifier implements Notifier {
        // ...SMS needs an account id, a token, and a sender phone number.
        constructor(
            private accountSid: string,
            private authToken: string,
            private fromNumber: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  SMS from ${this.fromNumber} (acct ${this.accountSid}) to ${to}: ${message}`);
        }
    }

    export function demo(): void {
        console.log("\n--- Stage 0: no factory ---");

        const activeChannel = "email";
        let notifier: Notifier;

        // THE PAIN: repeated in signup.ts, resetPassword.ts, orders.ts...
        if (activeChannel === "email") {
            notifier = new EmailNotifier("smtp.mail.com", 587, "no-reply@app.com");
        } else {
            notifier = new SmsNotifier("AC123", "secret", "+10000000000");
        }

        notifier.send("priya@example.com", "Welcome aboard!");
    }
}


/* ============================================================================
 * STAGE 1 — SIMPLE FACTORY
 * ============================================================================
 * One function owns the `new`. Same two rules as before:
 *   a) the parameter is a UNION ("email" | "sms"), so the switch is complete
 *      and a typo like "emial" is a compile error, not a runtime surprise;
 *   b) the return type is the INTERFACE, so callers never see EmailNotifier.
 */
namespace Stage1_SimpleFactory {

    export type Channel = "email" | "sms";

    export interface Notifier {
        send(to: string, message: string): void;
    }

    export class EmailNotifier implements Notifier {
        constructor(
            private smtpHost: string,
            private port: number,
            private fromAddress: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  Email via ${this.smtpHost}:${this.port} from ${this.fromAddress} to ${to}: ${message}`);
        }
    }

    export class SmsNotifier implements Notifier {
        constructor(
            private accountSid: string,
            private authToken: string,
            private fromNumber: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  SMS from ${this.fromNumber} (acct ${this.accountSid}) to ${to}: ${message}`);
        }
    }

    export function createNotifier(channel: Channel): Notifier {
        switch (channel) {
            case "email": return new EmailNotifier("smtp.mail.com", 587, "no-reply@app.com");
            case "sms": return new SmsNotifier("AC123", "secret", "+10000000000");
        }
    }

    export function demo(): void {
        console.log("\n--- Stage 1: simple factory ---");
        createNotifier("email").send("priya@example.com", "Welcome aboard!");
    }

    /* REMAINING PAIN: the SMTP host and SMS token are hardcoded in the factory,
     * and the caller still has to say "email". -> Stage 2. */
}


/* ============================================================================
 * STAGE 2 — CONFIG-DRIVEN FACTORY
 * ============================================================================
 * Settings move into a config object (env vars in a real app). The factory
 * maps ONE uniform config onto constructors that DON'T MATCH each other.
 * The caller now names no channel and no credentials.
 */
namespace Stage2_ConfigDriven {

    export type Channel = "email" | "sms";

    export interface Notifier {
        send(to: string, message: string): void;
    }

    export class EmailNotifier implements Notifier {
        constructor(
            private smtpHost: string,
            private port: number,
            private fromAddress: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  Email via ${this.smtpHost}:${this.port} from ${this.fromAddress} to ${to}: ${message}`);
        }
    }

    export class SmsNotifier implements Notifier {
        constructor(
            private accountSid: string,
            private authToken: string,
            private fromNumber: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  SMS from ${this.fromNumber} (acct ${this.accountSid}) to ${to}: ${message}`);
        }
    }

    export const config = {
        channel: "sms" as Channel,
        email: { smtpHost: "smtp.mail.com", port: 587, fromAddress: "no-reply@app.com" },
        sms: { accountSid: "AC123", authToken: "secret", fromNumber: "+10000000000" },
    };

    export function createNotifier(): Notifier {
        switch (config.channel) {
            case "email":
                return new EmailNotifier(config.email.smtpHost, config.email.port, config.email.fromAddress);
            case "sms":
                return new SmsNotifier(config.sms.accountSid, config.sms.authToken, config.sms.fromNumber);
        }
    }

    export function demo(): void {
        console.log("\n--- Stage 2: config-driven ---");

        // config.channel is "sms" here — this line doesn't know or care.
        createNotifier().send("+19999999999", "Your OTP is 4821");
    }

    /* REMAINING PAIN: adding Push means editing the Channel union, the config,
     * AND the switch in this file. -> Stage 3. */
}


/* ============================================================================
 * STAGE 3 — REGISTRY
 * ============================================================================
 * The switch becomes a lookup table held as DATA. Each channel registers
 * itself, so adding Push needs no edit to createNotifier().
 *
 * Same price as before: `registry[name]` can be missing at runtime, and
 * `Record<string, Creator>` hides that from the compiler — the guard is on you.
 */
namespace Stage3_Registry {

    export type Channel = "email" | "sms" | "push";

    export interface Notifier {
        send(to: string, message: string): void;
    }

    export class EmailNotifier implements Notifier {
        constructor(
            private smtpHost: string,
            private port: number,
            private fromAddress: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  Email via ${this.smtpHost}:${this.port} from ${this.fromAddress} to ${to}: ${message}`);
        }
    }

    export class SmsNotifier implements Notifier {
        constructor(
            private accountSid: string,
            private authToken: string,
            private fromNumber: string
        ) { }

        send(to: string, message: string): void {
            console.log(`  SMS from ${this.fromNumber} (acct ${this.accountSid}) to ${to}: ${message}`);
        }
    }

    // The new channel. Only ONE constructor field — shapes still don't match.
    export class PushNotifier implements Notifier {
        constructor(private serverKey: string) { }

        send(to: string, message: string): void {
            console.log(`  Push to device ${to}: ${message}`);
        }
    }

    export const config = {
        channel: "push" as Channel,
        email: { smtpHost: "smtp.mail.com", port: 587, fromAddress: "no-reply@app.com" },
        sms: { accountSid: "AC123", authToken: "secret", fromNumber: "+10000000000" },
        push: { serverKey: "fcm-key-xyz" },
    };

    type Creator = (cfg: any) => Notifier;

    const registry: Record<string, Creator> = {};

    export function register(name: string, create: Creator): void {
        registry[name] = create;
    }

    // In a real project each line sits next to its class in its own file.
    register("email", (c) => new EmailNotifier(c.smtpHost, c.port, c.fromAddress));
    register("sms", (c) => new SmsNotifier(c.accountSid, c.authToken, c.fromNumber));
    register("push", (c) => new PushNotifier(c.serverKey));

    export function createNotifier(): Notifier {
        const create = registry[config.channel];
        if (!create) {
            throw new Error(`Unknown notification channel: ${config.channel}`);
        }
        return create(config[config.channel]);
    }

    export function demo(): void {
        console.log("\n--- Stage 3: registry ---");
        createNotifier().send("device-token-abc", "Your order has shipped");
    }
}


/* ============================================================================
 * STAGE 4 — ABSTRACT FACTORY
 * ============================================================================
 * A notification is really TWO objects: a FORMATTER that turns the message into
 * the channel's shape, and a SENDER that delivers it.
 *
 * THE BUG THIS PREVENTS: build them with two separate factories and they can
 * disagree. An HTML email body sent as an SMS arrives as
 * "<h1>Hi</h1><p>Your OTP...", eats the 160-char limit, and nothing throws.
 * That is a MISMATCHED FAMILY.
 *
 * THE FIX: one factory per channel builds BOTH, so the channel is picked once.
 *
 * WHEN *NOT* TO USE IT: if the formatter is only ever used by its own sender,
 * just put format() inside send(). Keep them separate only when other code
 * needs the formatter alone (e.g. a "preview this message" screen).
 */
namespace Stage4_AbstractFactory {

    // --- the family ---
    export interface Formatter {
        format(title: string, body: string): string;
    }

    export interface Sender {
        send(to: string, formatted: string): void;
    }

    // --- the abstract factory ---
    export interface NotificationFactory {
        createFormatter(): Formatter;
        createSender(): Sender;
    }

    // --- Email family: HTML ---
    class HtmlFormatter implements Formatter {
        format(title: string, body: string): string {
            return `<h1>${title}</h1><p>${body}</p>`;
        }
    }

    class EmailSender implements Sender {
        constructor(private fromAddress: string) { }
        send(to: string, formatted: string): void {
            console.log(`  Email from ${this.fromAddress} to ${to}: ${formatted}`);
        }
    }

    // --- SMS family: short plain text ---
    class SmsFormatter implements Formatter {
        format(title: string, body: string): string {
            return `${title}: ${body}`.slice(0, 160);
        }
    }

    class SmsSender implements Sender {
        constructor(private fromNumber: string) { }
        send(to: string, formatted: string): void {
            console.log(`  SMS from ${this.fromNumber} to ${to}: ${formatted}`);
        }
    }

    // --- concrete factories: each only builds its own channel ---
    class EmailFactory implements NotificationFactory {
        constructor(private fromAddress: string) { }
        createFormatter(): Formatter { return new HtmlFormatter(); }
        createSender(): Sender { return new EmailSender(this.fromAddress); }
    }

    class SmsFactory implements NotificationFactory {
        constructor(private fromNumber: string) { }
        createFormatter(): Formatter { return new SmsFormatter(); }
        createSender(): Sender { return new SmsSender(this.fromNumber); }
    }

    export const config = {
        channel: "email" as "email" | "sms",
        email: { fromAddress: "no-reply@app.com" },
        sms: { fromNumber: "+10000000000" },
    };

    // The channel decision, made exactly once.
    export function getNotificationFactory(): NotificationFactory {
        return config.channel === "sms"
            ? new SmsFactory(config.sms.fromNumber)
            : new EmailFactory(config.email.fromAddress);
    }

    export function demo(): void {
        console.log("\n--- Stage 4: abstract factory ---");

        const factory = getNotificationFactory();
        const text = factory.createFormatter().format("Welcome", "Thanks for signing up");
        factory.createSender().send("priya@example.com", text);

        // Flip config.channel to "sms" and formatter + sender switch together.
        // Concrete factories are unexported, so there's no way to mix them.
    }
}


/* ============================================================================
 * STAGE 5 — FACTORY METHOD (GoF)
 * ============================================================================
 * A base class owns the WORKFLOW (check quiet hours, send, record it) and
 * leaves ONE creation step abstract. Each subclass decides what gets built.
 */
namespace Stage5_FactoryMethod {

    export interface Notifier {
        send(to: string, message: string): void;
    }

    class EmailNotifier implements Notifier {
        constructor(private fromAddress: string) { }
        send(to: string, message: string): void {
            console.log(`  Email from ${this.fromAddress} to ${to}: ${message}`);
        }
    }

    class SmsNotifier implements Notifier {
        constructor(private fromNumber: string) { }
        send(to: string, message: string): void {
            console.log(`  SMS from ${this.fromNumber} to ${to}: ${message}`);
        }
    }

    export abstract class NotificationService {
        // THE FACTORY METHOD: subclasses fill it in.
        protected abstract createNotifier(): Notifier;

        // Shared workflow — the reason the base class exists.
        notify(to: string, message: string): void {
            console.log(`  [check] ${to} is not in quiet hours`);   // shared step
            this.createNotifier().send(to, message);                // <- deferred to subclass
            console.log(`  [log] notification recorded`);           // shared step
        }
    }

    export class EmailService extends NotificationService {
        constructor(private fromAddress: string) { super(); }
        protected createNotifier(): Notifier { return new EmailNotifier(this.fromAddress); }
    }

    export class SmsService extends NotificationService {
        constructor(private fromNumber: string) { super(); }
        protected createNotifier(): Notifier { return new SmsNotifier(this.fromNumber); }
    }

    export function demo(): void {
        console.log("\n--- Stage 5: factory method ---");

        const service: NotificationService = new SmsService("+10000000000");
        service.notify("+19999999999", "Your OTP is 4821");
    }
}


/* ============================================================================
 * RUN EVERYTHING — a runtime smoke check. Types are checked only by tsc.
 * ============================================================================ */
Stage0_NoFactory.demo();
Stage1_SimpleFactory.demo();
Stage2_ConfigDriven.demo();
Stage3_Registry.demo();
Stage4_AbstractFactory.demo();
Stage5_FactoryMethod.demo();
