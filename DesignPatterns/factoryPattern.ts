/**
 * ============================================================================
 *  FACTORY PATTERN — learning reference
 * ============================================================================
 *
 *  THE ONE-LINE IDEA
 *  Creating an object ("new X(...)") is knowledge. If every caller has that
 *  knowledge, every caller must change when creation changes. A factory is the
 *  single place that holds it, so callers only know the interface.
 *
 *  THE THREE PATTERNS PEOPLE CONFUSE (all shown below)
 *    Simple Factory   -> "give me A thing"          (a function + a switch)
 *    Factory Method   -> "SUBCLASSES decide which"  (abstract method, overridden)
 *    Abstract Factory -> "give me a MATCHED SET"    (one object makes a family)
 *
 *  STAGES IN THIS FILE — each builds on the last, each fixes the previous pain
 *    Stage 0  No factory at all               -> shows the pain
 *    Stage 1  Simple Factory                  -> creation moves to one place
 *    Stage 2  Config-driven factory           -> credentials leave the caller
 *    Stage 3  Registry                        -> add providers without editing it
 *    Stage 4  Abstract Factory                -> vendor parts can't be mismatched
 *    Stage 5  Factory Method (GoF)            -> subclass decides what to build
 *
 *  Each stage lives in its own `namespace` ONLY so the same class names can be
 *  reused across stages in one file. In a real project these would be modules.
 *
 *  Run it:  npx tsx factoryPattern.ts
 * ============================================================================
 */


/* ============================================================================
 * STAGE 0 — NO FACTORY (the problem)
 * ============================================================================
 * The caller does the `new` itself. That means the caller must know:
 *   1. which vendor is active, and
 *   2. what fields that vendor's constructor needs.
 *
 * WHY IT HURTS: copy this block to all 10 places in your app that upload a
 * file, then try switching vendors. You edit 10 places and miss one.
 */
namespace Stage0_NoFactory {

    export interface StorageProvider {
        upload(file: string, path: string): void;
    }

    export class S3Storage implements StorageProvider {
        // Note the constructors DON'T MATCH — this is the whole reason a
        // factory is worth having. S3 needs 3 things...
        constructor(
            private bucket: string,
            private region: string,
            private accessKey: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  S3: uploaded ${file} to ${this.bucket} (${this.region}) at ${path}`);
        }
    }

    export class GcsStorage implements StorageProvider {
        // ...and GCS needs 2 completely different things.
        constructor(
            private projectId: string,
            private keyFile: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  GCS: uploaded ${file} to ${this.projectId} at ${path}`);
        }
    }

    export function demo(): void {
        console.log("\n--- Stage 0: no factory ---");

        const activeProvider = "s3";
        let storage: StorageProvider;

        // THE PAIN: this if/else has to be repeated at every single call site,
        // and every call site has to know each vendor's constructor shape.
        if (activeProvider === "s3") {
            storage = new S3Storage("bucket1", "us-east", "1234");
        } else {
            storage = new GcsStorage("project1", "key.json");
        }

        storage.upload("report.pdf", "/reports/2026/");
    }
}


/* ============================================================================
 * STAGE 1 — SIMPLE FACTORY
 * ============================================================================
 * Move the `new` calls into ONE function. The caller names a provider and gets
 * back the interface — it never sees S3Storage or GcsStorage.
 *
 * TWO DETAILS THAT MATTER (both easy to get wrong):
 *   a) The parameter is a UNION TYPE ("s3" | "gcs"), not `string`. With
 *      `string`, TypeScript assumes someone could pass "azure" and the switch
 *      can fall through. With the return type declared (b), that is a compile
 *      error (TS2366). Without it, the return type silently becomes
 *      `... | undefined` and every caller is forced to write
 *      `createStorage("s3")?.upload(...)`. Either way, the compiler is telling
 *      you the parameter type is too wide.
 *   b) The RETURN TYPE is declared as the interface. Without it, TypeScript
 *      infers `S3Storage | GcsStorage` and leaks the concrete classes to the
 *      caller — which defeats the entire point of having a factory.
 *
 * With both in place the switch is exhaustive, so it needs no `default`.
 */
namespace Stage1_SimpleFactory {

    export type Provider = "s3" | "gcs";

    export interface StorageProvider {
        upload(file: string, path: string): void;
    }

    export class S3Storage implements StorageProvider {
        constructor(
            private bucket: string,
            private region: string,
            private accessKey: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  S3: uploaded ${file} to ${this.bucket} (${this.region}) at ${path}`);
        }
    }

    export class GcsStorage implements StorageProvider {
        constructor(
            private projectId: string,
            private keyFile: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  GCS: uploaded ${file} to ${this.projectId} at ${path}`);
        }
    }

    // THE FACTORY. `provider` is a union (a), return type is the interface (b).
    export function createStorage(provider: Provider): StorageProvider {
        switch (provider) {
            case "s3": return new S3Storage("bucket1", "us-east", "1234");
            case "gcs": return new GcsStorage("project1", "key.json");
        }
    }

    export function demo(): void {
        console.log("\n--- Stage 1: simple factory ---");

        // No `new`, no constructor fields, no `?.` — but still names a vendor.
        createStorage("s3").upload("report.pdf", "/reports/2026/");
    }

    /* REMAINING PAIN: the credentials "bucket1"/"1234" are hardcoded INSIDE the
     * factory. Nobody would ever really pass them, so the factory isn't hiding
     * anything real yet. And the caller still has to say "s3". -> Stage 2. */
}


/* ============================================================================
 * STAGE 2 — CONFIG-DRIVEN FACTORY
 * ============================================================================
 * Credentials move out of the factory body into a config object (in a real app
 * this is read from env vars). The factory's job becomes the interesting part:
 *
 *   take ONE uniform input (the config) and map it onto constructor signatures
 *   that DON'T MATCH each other.
 *
 * That mapping is the real answer to "why not just call `new`?" — because
 * otherwise every caller would need to know which vendor wants which fields.
 *
 * The call site now mentions NO vendor and NO credentials at all.
 */
namespace Stage2_ConfigDriven {

    export type Provider = "s3" | "gcs";

    export interface StorageProvider {
        upload(file: string, path: string): void;
    }

    export class S3Storage implements StorageProvider {
        constructor(
            private bucket: string,
            private region: string,
            private accessKey: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  S3: uploaded ${file} to ${this.bucket} (${this.region}) at ${path}`);
        }
    }

    export class GcsStorage implements StorageProvider {
        constructor(
            private projectId: string,
            private keyFile: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  GCS: uploaded ${file} to ${this.projectId} at ${path}`);
        }
    }

    // App settings: which provider is live + one block of fields per provider.
    // Each block has its OWN shape, matching that vendor's constructor.
    export const config = {
        provider: "s3" as Provider,
        s3: { bucket: "bucket1", region: "us-east", accessKey: "1234" },
        gcs: { projectId: "project1", keyFile: "key.json" },
    };

    // Takes no arguments now — it reads the config itself.
    export function createStorage(): StorageProvider {
        switch (config.provider) {
            case "s3":
                return new S3Storage(config.s3.bucket, config.s3.region, config.s3.accessKey);
            case "gcs":
                return new GcsStorage(config.gcs.projectId, config.gcs.keyFile);
        }
    }

    export function demo(): void {
        console.log("\n--- Stage 2: config-driven ---");

        // Change config.provider to "gcs" and this line silently switches
        // the entire app's storage backend. Nothing else moves.
        createStorage().upload("report.pdf", "/reports/2026/");
    }

    /* REMAINING PAIN: adding a 3rd provider means editing THIS file 3 times —
     * the Provider union, the config, and the switch. In a big codebase this
     * file becomes a bottleneck every team has to touch. -> Stage 3. */
}


/* ============================================================================
 * STAGE 3 — REGISTRY  (Open/Closed Principle in practice)
 * ============================================================================
 * A registry is just a LOOKUP TABLE: name -> how to build that thing.
 *
 * A `switch` is a lookup table written as CODE. A registry is the same lookup
 * table written as DATA. That one difference is everything:
 *
 *      you CANNOT add a `case` to a switch from another file.
 *      you CAN add a key to an object from another file.
 *
 * So each provider registers ITSELF, and the factory never learns it exists.
 * Adding a provider = new class + one register() call + a config block.
 * ZERO edits to createStorage(). That is "open for extension, closed for
 * modification" — same idea as ../SOLID/OCP.ts, now with a reason to exist.
 * (In this single file you still edit the Provider union and the config. Only
 * the switch is gone. Split into modules, the config would come from outside.)
 *
 * THE PRICE YOU PAY: the registry is open, so TypeScript can no longer prove
 * the lookup will find anything. `registry[name]` may be undefined at runtime,
 * yet `Record<string, Creator>` types it as `Creator`, so the compiler WON'T
 * warn you (only `noUncheckedIndexedAccess` would). The runtime guard is on
 * you. Stage 2's switch had that guarantee for free. You traded compile-time
 * safety for extensibility — a real cost, not a free win.
 */
namespace Stage3_Registry {

    export type Provider = "s3" | "gcs" | "disk";

    export interface StorageProvider {
        upload(file: string, path: string): void;
    }

    export class S3Storage implements StorageProvider {
        constructor(
            private bucket: string,
            private region: string,
            private accessKey: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  S3: uploaded ${file} to ${this.bucket} (${this.region}) at ${path}`);
        }
    }

    export class GcsStorage implements StorageProvider {
        constructor(
            private projectId: string,
            private keyFile: string
        ) { }

        upload(file: string, path: string): void {
            console.log(`  GCS: uploaded ${file} to ${this.projectId} at ${path}`);
        }
    }

    export class DiskStorage implements StorageProvider {
        constructor(private baseDir: string) { }

        upload(file: string, path: string): void {
            console.log(`  Disk: uploaded ${file} to ${this.baseDir}${path}`);
        }
    }

    export const config = {
        provider: "s3" as Provider,
        s3: { bucket: "bucket1", region: "us-east", accessKey: "1234" },
        gcs: { projectId: "project1", keyFile: "key.json" },
        disk: { baseDir: "/files" },
    };

    // A creator takes that provider's config block and returns the interface.
    // It takes cfg as a PARAMETER instead of reaching for the global `config`
    // — that is what lets these functions live in another file later.
    type Creator = (cfg: any) => StorageProvider;

    // Starts EMPTY. The registry itself names no vendors.
    const registry: Record<string, Creator> = {};

    // All it does is put a key in the object.
    export function register(name: string, create: Creator): void {
        registry[name] = create;
    }

    // In a real project each of these lines lives in its own file next to its
    // class (s3Storage.ts, gcsStorage.ts, diskStorage.ts) — which is the point:
    // the factory below never mentions a vendor.
    register("s3", (c) => new S3Storage(c.bucket, c.region, c.accessKey));
    register("gcs", (c) => new GcsStorage(c.projectId, c.keyFile));
    register("disk", (c) => new DiskStorage(c.baseDir));

    export function createStorage(): StorageProvider {
        const create = registry[config.provider];             // look up the name
        if (!create) {                                        // the price, paid here
            throw new Error(`Unknown storage provider: ${config.provider}`);
        }
        return create(config[config.provider]);               // hand it its config block
    }

    export function demo(): void {
        console.log("\n--- Stage 3: registry ---");
        createStorage().upload("report.pdf", "/reports/2026/");
    }
}


/* ============================================================================
 * STAGE 4 — ABSTRACT FACTORY
 * ============================================================================
 * So far storage did ONE thing: upload. Real storage does several — upload a
 * file, and sign a temporary URL so a browser can read a private file.
 *
 * THE BUG THIS PREVENTS: if you build a separate factory per capability, each
 * makes its OWN vendor decision:
 *
 *      createUploader()    // reads config -> S3Uploader
 *      createUrlSigner()   // reads config differently -> GcsUrlSigner
 *
 * Nothing forces those to agree. One config override during a migration, one
 * test that stubs only one of them, and you upload the file to an S3 bucket
 * but hand the user a googleapis.com link. The link 404s. Nothing throws —
 * both objects are individually valid, they're just not from the same vendor.
 * That is a MISMATCHED FAMILY, and it is miserable to debug.
 *
 * THE FIX: one factory object per vendor that produces the WHOLE SET. You pick
 * the vendor ONCE, so there is no second decision that could disagree.
 * S3Factory has no code path that returns a GCS part — mixing is unwritable.
 *
 *      Factory          = "give me A thing"
 *      Abstract Factory = "give me a MATCHED SET of things"
 *
 * WHEN *NOT* TO USE IT (be honest with yourself): for this example you could
 * just put upload() and sign() on one fat StorageProvider interface. One
 * object, two methods, same guarantee, far less machinery — and that is the
 * better call here. Abstract Factory earns its keep only when the family
 * members must be SEPARATE objects: different parts of the app get handed only
 * the signer, or the uploader holds an expensive connection you don't always
 * want open, or they have different lifetimes.
 */
namespace Stage4_AbstractFactory {

    // --- the family: two capabilities, two interfaces ---
    export interface Uploader {
        upload(file: string, path: string): void;
    }

    export interface UrlSigner {
        sign(path: string): string;
    }

    // --- the abstract factory: promises a matched set, names no vendor ---
    export interface StorageFactory {
        createUploader(): Uploader;
        createUrlSigner(): UrlSigner;
    }

    // --- S3's family members ---
    class S3Uploader implements Uploader {
        constructor(private bucket: string) { }
        upload(file: string, path: string): void {
            console.log(`  S3: uploaded ${file} to bucket ${this.bucket} at ${path}`);
        }
    }

    class S3UrlSigner implements UrlSigner {
        constructor(private bucket: string) { }
        sign(path: string): string {
            // Note how different this is from the GCS one — an S3 upload signed
            // by the GCS signer produces a URL pointing at a file that is
            // simply not there.
            return `https://${this.bucket}.s3.amazonaws.com${path}?sig=abc123`;
        }
    }

    // --- GCS's family members ---
    class GcsUploader implements Uploader {
        constructor(private projectId: string) { }
        upload(file: string, path: string): void {
            console.log(`  GCS: uploaded ${file} to project ${this.projectId} at ${path}`);
        }
    }

    class GcsUrlSigner implements UrlSigner {
        constructor(private projectId: string) { }
        sign(path: string): string {
            return `https://storage.googleapis.com/${this.projectId}${path}?sig=xyz789`;
        }
    }

    // --- the concrete factories: each can only ever build its own vendor ---
    export class S3Factory implements StorageFactory {
        constructor(private bucket: string) { }
        createUploader(): Uploader { return new S3Uploader(this.bucket); }
        createUrlSigner(): UrlSigner { return new S3UrlSigner(this.bucket); }
    }

    export class GcsFactory implements StorageFactory {
        constructor(private projectId: string) { }
        createUploader(): Uploader { return new GcsUploader(this.projectId); }
        createUrlSigner(): UrlSigner { return new GcsUrlSigner(this.projectId); }
    }

    export const config = {
        provider: "s3" as "s3" | "gcs",
        s3: { bucket: "bucket1" },
        gcs: { projectId: "project1" },
    };

    // THE VENDOR DECISION, MADE EXACTLY ONCE. Everything after this line is
    // guaranteed to come from the same vendor.
    export function getStorageFactory(): StorageFactory {
        return config.provider === "gcs"
            ? new GcsFactory(config.gcs.projectId)
            : new S3Factory(config.s3.bucket);
    }

    export function demo(): void {
        console.log("\n--- Stage 4: abstract factory ---");

        const factory = getStorageFactory();   // <- choose vendor here, once
        factory.createUploader().upload("report.pdf", "/reports/2026/");
        console.log("  " + factory.createUrlSigner().sign("/reports/2026/report.pdf"));

        // Flip config.provider to "gcs" and BOTH lines switch together.
        // Through getStorageFactory() there is no way to get an S3 uploader
        // and a GCS signer. (Calling `new S3Factory` / `new GcsFactory`
        // directly bypasses that — keep the concrete factories unexported in
        // a real module.)
    }
}


/* ============================================================================
 * STAGE 5 — FACTORY METHOD (the real GoF pattern of that name)
 * ============================================================================
 * Everything above called a plain function — that is "Simple Factory", which
 * isn't in the Gang of Four book at all. FACTORY METHOD is different:
 *
 *   a base class contains the WORKFLOW but leaves ONE creation step abstract,
 *   and each subclass overrides that step to decide what actually gets built.
 *
 * The base class calls this.createUploader() without knowing (or caring) which
 * subclass it is running in. Creation is chosen by INHERITANCE, not by a
 * switch or a lookup.
 *
 * Use it when the surrounding steps are shared but one object varies. If there
 * is no shared workflow to inherit, a plain function (Stage 1-3) is simpler
 * and better — don't introduce a class hierarchy just to say `new`.
 */
namespace Stage5_FactoryMethod {

    export interface Uploader {
        upload(file: string, path: string): void;
    }

    class S3Uploader implements Uploader {
        constructor(private bucket: string) { }
        upload(file: string, path: string): void {
            console.log(`  S3: uploaded ${file} to ${this.bucket} at ${path}`);
        }
    }

    class GcsUploader implements Uploader {
        constructor(private projectId: string) { }
        upload(file: string, path: string): void {
            console.log(`  GCS: uploaded ${file} to ${this.projectId} at ${path}`);
        }
    }

    export abstract class StorageClient {
        // THE FACTORY METHOD: no body here. Subclasses fill it in.
        protected abstract createUploader(): Uploader;

        // The shared workflow. This is the reason the base class exists — it
        // owns the common steps and only defers the one varying piece.
        save(file: string, path: string): void {
            console.log(`  [audit] saving ${file}`);          // shared step
            this.createUploader().upload(file, path);         // <- deferred to subclass
            console.log(`  [audit] done`);                    // shared step
        }
    }

    export class S3Client extends StorageClient {
        constructor(private bucket: string) { super(); }
        protected createUploader(): Uploader { return new S3Uploader(this.bucket); }
    }

    export class GcsClient extends StorageClient {
        constructor(private projectId: string) { super(); }
        protected createUploader(): Uploader { return new GcsUploader(this.projectId); }
    }

    export function demo(): void {
        console.log("\n--- Stage 5: factory method ---");

        // Same save() workflow, different object created inside it.
        const client: StorageClient = new S3Client("bucket1");
        client.save("report.pdf", "/reports/2026/");
    }
}


/* ============================================================================
 * RUN EVERYTHING — a runtime smoke check. If a stage throws, it and every
 * stage after it stop printing. `tsx` does NOT type-check, so the type claims
 * above are only verified by:  npx tsc --noEmit --strict factoryPattern.ts
 * ============================================================================ */
Stage0_NoFactory.demo();
Stage1_SimpleFactory.demo();
Stage2_ConfigDriven.demo();
Stage3_Registry.demo();
Stage4_AbstractFactory.demo();
Stage5_FactoryMethod.demo();
