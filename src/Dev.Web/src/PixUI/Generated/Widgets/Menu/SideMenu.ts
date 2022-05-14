export class SideMenu {
    public Init(props: Partial<SideMenu>): SideMenu {
        Object.assign(this, props);
        return this;
    }

    //TODO:直接用TreeView实现
}
