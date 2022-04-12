export class Random {
    public Next(min: number, max: number): number {
        //TODO: fix
        return (Math.random() * (max - min)) | 0;
    }
}
