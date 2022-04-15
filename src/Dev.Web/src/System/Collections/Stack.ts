import {List} from './List'

export class Stack<T> extends List<T> {

    public Push(item: T) {
        this.Add(item);
    }

    public Pop(): Nullable<T> {
        if (this.length === 0) throw new Error('Stack is empty');

        return this.splice(this.length - 1, 1)[0];
    }
}