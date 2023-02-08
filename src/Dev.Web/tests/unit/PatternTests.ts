export {}
// import {instanceOf, isMatching, match, select} from "ts-pattern";
//
// class Dog {
//     Wang() {
//         console.log("Wang, Wang")
//     }
// }
//
// class Cat {
//     Meow() {
//         console.log("Meow, Meow")
//     }
// }
//
// describe("Pattern tests", () => {
//
//     it("Base test", () => {
//         let a: number = 2;
//
//         const res = match<number, string>(a)
//             .with(1, (t) => "1")
//             .with(2, () => "2")
//             .otherwise(() => "default");
//
//         expect(res).toEqual("2");
//     });
//
//     it("When test", () => {
//         let a: number = 2;
//
//         const res = match<number, string>(a)
//             .when(t => t < 0, () => "<0")
//             .when(t => t === 0, () => "==0")
//             // .with(2, () => "2")
//             .when(t => t > 0, () => ">0")
//             .otherwise(() => "default");
//
//         expect(res).toEqual(">0");
//     });
//
//     it("InstanceOf Test", () => {
//         let obj: object = new Cat();
//
//         match(obj)
//             .with(instanceOf(Dog), dog => dog.Wang())
//             .when(t => t instanceof Cat, (cat: Cat) => cat.Meow())
//             // .with(instanceOf(Cat), cat => cat.Meow())
//             .otherwise(() => console.log("Not match"))
//     })
//
//     it("IsMatching Test", () => {
//         let obj: object = new Cat();
//         if (isMatching(instanceOf(Cat), obj)) {
//             obj.Meow();
//         }
//     });
// });
