export class EntityMembmerVO {

    public Init(props: Partial<EntityMembmerVO>): EntityMembmerVO {
        Object.assign(this, props);
        return this;
    }

}

export class EntityModelVO {
    public Name: string = "";

    public Init(props: Partial<EntityModelVO>): EntityModelVO {
        Object.assign(this, props);
        return this;
    }
}
