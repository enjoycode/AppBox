import * as AppBoxDesign from '@/AppBoxDesign'
import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class HomePage extends PixUI.View {
    public constructor() {
        super();
        let navigator = new PixUI.Navigator(new System.List<PixUI.Route>().Init(
            [
                new PixUI.Route("Login", async s => {
                    return new AppBoxDesign.LoginPage();
                }),
                new PixUI.Route("IDE", async s => {
                    return new AppBoxDesign.AppStudio();
                }),
            ]));

        this.Child = new PixUI.RouteView(navigator);
    }
}
