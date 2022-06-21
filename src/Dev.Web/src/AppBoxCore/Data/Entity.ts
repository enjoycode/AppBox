export abstract class Entity {
    public abstract get ModelId(): bigint;
    
}

export abstract class DbEntity extends Entity {
    
}