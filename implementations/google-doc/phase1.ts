
class DocumentEditor{
    private data: string[] = [];
    constructor() { }
    
    addText(text: string): void{
        this.data.push(text);
        console.log("Text added to the doc: ", text);
    }

    addImage(imgPath: string): void{
        this.data.push(imgPath);
        console.log("Image added to the doc: ", imgPath);
    }

    render(): void{
        let result: string = "";
        for (let i = 0; i < this.data.length; i++){
            if (this.data[i].endsWith('.jpg')) {
                result += `[image:${this.data[i]}]`;
            }
            else {
                result += this.data[i];
            }
        }
        console.log(result);
    }

    save(): void{
        console.log("Data has been saved to the DB")
    }
}

function doc() {
    const doc = new DocumentEditor();
    doc.addText("My name is Priyanshu. ");
    doc.addImage("priyanshu.jpg");
    doc.addImage(" I live in Karnataka");

    doc.render();
    doc.save();
}
doc();



//But here we are doing everthing in the single class .. Its breaking the SRP principle and OCP
//Now we have to identify what we can do