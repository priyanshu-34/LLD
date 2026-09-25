/*
=====================================================
LISKOV SUBSTITUTION PRINCIPLE (LSP)
=====================================================
In simple words:
  If class B extends class A, then anywhere in the code
  that uses A, you should be able to put a B instead —
  and nothing should break or behave unexpectedly.

  The child class should only ADD to what the parent does,
  never take away or change what the parent already promised.

How to spot a violation:
  If a child class overrides a method just to throw an
  error, or leaves it empty, or makes it do something
  totally different from what the parent method did —
  that's a sign this rule is being broken.
=====================================================
*/


/* -----------------------------------------------------
   ❌ THE PROBLEM (wrong way of doing it)
   -----------------------------------------------------
   TextDocument can be read and written.
   We now want a "read-only" version of it, so we create
   ProtectedDocument that extends TextDocument.

   But a read-only document should never allow writing —
   so we override write() and make it throw an error.

   Why this is wrong:
   Anyone using TextDocument expects write() to actually
   save changes, that's the promise the parent class makes.
   ProtectedDocument secretly breaks that promise — if you
   hand a ProtectedDocument to code that expects a normal
   TextDocument, calling write() will crash instead of
   working. The child is not truly a "replacement" for the
   parent anymore, which is exactly what this principle
   says should never happen.
----------------------------------------------------- */

class TextDocument {
    protected data: string;
    constructor(data: string) {
        this.data = data;
    }
    read() {
        console.log("Reading the document: " + this.data);
    }
    write() {
        console.log("Editing the document: " + this.data);
    }
}

class ProtectedDocument extends TextDocument {
    write() {
        throw new Error("Editing is not allowed as this is a Protected Document");
    }
}

function lspBadExample() {
    const doc1 = new TextDocument("doc1");
    const doc2 = new ProtectedDocument("doc2");

    doc1.read();
    doc1.write();
    doc2.read();
    doc2.write(); // 💥 crashes here — surprise for anyone who expected write() to just work
}

// lspBadExample();


/* -----------------------------------------------------
   ✅ THE FIX
   -----------------------------------------------------
   The real problem is that we forced "write" onto every
   document, even the ones that should never support it.

   Instead, we split "can read" and "can write" into two
   separate, small interfaces:

   - ReadableDoc  → just has read(). Every document can do this.
   - WritableDoc  → has read() AND write(). Only documents
                    that truly support editing use this one.

   Now a read-only document simply implements ReadableDoc
   and never has a write() method at all — there's nothing
   to override, nothing to throw, nothing to break.
----------------------------------------------------- */

interface ReadableDoc {
    read(): void;
}

interface WritableDoc extends ReadableDoc {
    write(): void;
}

class ReadOnlyDoc implements ReadableDoc {
    constructor(protected data: string) {}

    read() {
        console.log("Here is your content: " + this.data);
    }
}

class EditableDoc implements WritableDoc {
    constructor(protected data: string) {}

    read() {
        console.log("Here is your content: " + this.data);
    }
    write() {
        console.log("This is your editable content, start editing");
    }
}

function lspGoodExample() {
    const doc1 = new ReadOnlyDoc("doc1");
    const doc2 = new EditableDoc("doc2");

    doc1.read();
    doc2.read();
    doc2.write();
    // doc1.write(); <- this line wouldn't even compile, write() doesn't exist on ReadOnlyDoc
    // so there's no way to call it by mistake, no runtime surprises
}

lspGoodExample();


/* -----------------------------------------------------
   TL;DR — the one thing to remember
   -----------------------------------------------------
   - Bad sign: a child class overrides a method just to
     throw an error or block something the parent allowed.
   - Good fix: don't force every child to inherit methods
     it can't support. Break behavior into small interfaces
     and let each class implement only what it can truly do.
----------------------------------------------------- */
