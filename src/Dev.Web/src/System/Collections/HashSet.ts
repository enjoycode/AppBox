export class HashSet<T> extends Set<T> {
    public Clear() {
        this.clear();
    }

    public Add (value: T) {
        this.add(value);
    }

    public Remove(value: T) {
        this.delete(value);
    }

    public get length(): number {
        return this.size;
    }
}