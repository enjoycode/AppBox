class Dog {
    public Wang() {
    }
}

class Cat {
    public Meow() {
    }
}

class Test {
    IfPattern() {
        let obj: object = new Cat();
        if (obj instanceof Dog) {
            const dog = obj;
            dog.Wang();
        } else if (obj instanceof Cat) {
            const cat = obj;
            cat.Meow();
        } else {
            console.log("What");
        }
    }

    SwitchPattern() {
        let obj: object = new Cat();
        match(obj)
            .when(t => t instanceof Dog, (dog: Dog) => {
                dog.Wang();
            })
            .when(t => t instanceof Cat, (cat: Cat) => {
                cat.Meow();
            })
            .otherwise(() => {
            })
    }
}

interface INameable {
    get Name(): string;

}

export function IsInterfaceOfINameable(obj: any): obj is INameable {
    return typeof obj === "object" && obj !== null && !Array.isArray(obj) && '$meta_PixUI_INameable' in obj.constructor;
}

class Person implements INameable {
    private static readonly $meta_PixUI_INameable = true;
    private _name: string = "Rick";

    public get Name(): string {
        return this._name;
    }

    public static Test() {
        let obj: any = new Person();
        if (IsInterfaceOfINameable(obj)) {
            console.log(obj.Name);
        }
    }
}
