/*
=====================================================
INTERFACE SEGREGATION PRINCIPLE (ISP)
=====================================================
In simple words:
  Don't force a class to implement methods it doesn't need.

  If you have one big interface with lots of methods, but
  different classes only ever need a few of those methods
  each, break that big interface into several small ones.
  Let each class pick only the small interfaces it actually needs.

Why this matters:
  A class forced to implement a method it has no real use
  for usually ends up throwing an error or leaving it empty
  just to satisfy the interface. That's a fake implementation,
  and it's a sign the interface was too broad to begin with.
=====================================================
*/


/* -----------------------------------------------------
   ❌ THE PROBLEM (wrong way of doing it)
   -----------------------------------------------------
   SingleBigInterface has both area() and volume().

   A Square is a 2D shape — it has an area, but no volume.
   A Cube is a 3D shape — it has both.

   Because Square is forced to implement the SAME interface
   as Cube, it has to write a volume() method even though a
   square doesn't have one. The only thing it can do is throw
   an error — a fake implementation just to satisfy the interface.
----------------------------------------------------- */

interface SingleBigInterface {
    area(): void;
    volume(): void;
}

class Square implements SingleBigInterface {
    constructor(private length: number) {}

    area() {
        console.log("Area of the square is: " + this.length * this.length);
    }

    volume() {
        // a square has no volume, this method only exists because
        // the interface forces it to — that's the actual problem
        throw new Error("Square is a 2D object and does not have any volume");
    }
}

class Cube implements SingleBigInterface {
    constructor(private length: number) {}

    area() {
        console.log("Area of the cube is: " + this.length * this.length);
    }

    volume() {
        console.log("Volume of the cube is: " + this.length * this.length * this.length);
    }
}


/* -----------------------------------------------------
   ✅ THE FIX
   -----------------------------------------------------
   Split the one big interface into smaller ones, grouped
   by what actually makes sense together:

   - TwoDShape    → just area(). Every shape has this.
   - ThreeDShape  → area() AND volume(). Only 3D shapes need this.

   A 2D shape like Square now only implements TwoDShape —
   there's no volume() method to fake anymore, so nothing to
   throw and no forced, meaningless code.
----------------------------------------------------- */

interface TwoDShape {
    area(): void;
}

interface ThreeDShape extends TwoDShape {
    volume(): void;
}

class Square2D implements TwoDShape {
    constructor(private length: number) {}

    area() {
        console.log("Area of the square is: " + this.length * this.length);
    }
}

class Cube3D implements ThreeDShape {
    constructor(private length: number) {}

    area() {
        console.log("Area of the cube is: " + this.length * this.length);
    }

    volume() {
        console.log("Volume of the cube is: " + this.length * this.length * this.length);
    }
}

function ispGoodExample() {
    const sq = new Square2D(10);
    const cb = new Cube3D(10);

    sq.area();
    cb.area();
    cb.volume();
    // sq.volume(); <- this line wouldn't even compile, volume() doesn't exist on Square2D
}

ispGoodExample();


/* -----------------------------------------------------
   TL;DR — the one thing to remember
   -----------------------------------------------------
   - Bad sign: a class implements a method just to throw an
     error or leave it empty because the interface forced it.
   - Good fix: break big interfaces into small, focused ones,
     each class implements only what it can truly support.
----------------------------------------------------- */
