
interface DocumentElementInterface{
    render(): string;
}
class TextEle implements DocumentElementInterface{
    constructor(private data: string) { }
    render(): string{
        return this.data;
    }
}

class ImageEle implements DocumentElementInterface{
    constructor(private data:string){}
    render(): string {
        return `[image:${this.data}]`
    }
}



class _Document{
    private data: DocumentElementInterface[] = []

    add(ele: DocumentElementInterface) {
        this.data.push(ele);
    }
    render(): string {
        // let result:string = ""
        // for (let i = 0; i < this.data.length; i++){
        //     result += this.data[i].render()
        // }
        
        // return result;
        return this.data.map(e => e.render()).join("\n")
    }
}

interface PersistanceInterface{
    save(data:string): void;
}
class SaveToDB implements PersistanceInterface{
    constructor() { }
    save(data:string) {
        console.log("Saved to DB: ", data);
    }
}
class SaveToRedis implements PersistanceInterface {
    constructor() { }
    save(data:string) {
        console.log("Saved to Redis: ",data);
    }
}


class _DocumentEditor{
    private doc: _Document;

    constructor() {
        this.doc = new _Document(); 
    }

    addText(text: string) {
        this.doc.add(new TextEle(text));
    }
    addImage(img: string) {
        this.doc.add(new ImageEle(img));
    }
    render() {
        const res = this.doc.render()
        console.log("Rendered: ", res)
    }

    save(persistTo: PersistanceInterface) {
        const data = this.doc.render()
        persistTo.save(data);
    }
}


function main() {
    const newDocEditor = new _DocumentEditor();
    newDocEditor.addText("My name is Priyanshu");
    newDocEditor.addImage("priyanshu.png");
    newDocEditor.addText("I live in Bengaluru");

    newDocEditor.render();
    newDocEditor.save(new SaveToDB());
    newDocEditor.save(new SaveToRedis());
}
main();