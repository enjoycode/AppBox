import * as System from '/System.js'
import * as PixUI from '/PixUI.js'
import * as AppBoxClient from '/AppBoxClient.js'

System.initializeSystem();
AppBoxClient.initializeAppBoxClient();
AppBoxClient.Channel.Init(new AppBoxClient.WebChannel());
PixUI.WebApplication.Run(() => new PixUI.Text(new PixUI.Rx("Hello World")));

export {}