import * as System from '@/System'
import * as PixUI from '@/PixUI'
import * as AppBoxDesign from '@/AppBoxDesign'

export class HomePage extends PixUI.View {
    public constructor() {
        super();
        let navigator = new PixUI.Navigator(new System.List<PixUI.Route>().Init([new PixUI.Route("Login", s => new AppBoxDesign.LoginPage()), new PixUI.Route("IDE", s => new AppBoxDesign.AppStudio())]));

        this.Child = new PixUI.RouteView(navigator);
    }

    public Init(props: Partial<HomePage>): HomePage {
        Object.assign(this, props);
        return this;
    }
}
