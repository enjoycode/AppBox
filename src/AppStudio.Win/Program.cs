// See https://aka.ms/new-console-template for more information

using AppBoxClient;
using AppBoxDesign;
using PixUI.Platform.Win;

Channel.Init(new WebSocketChannel(new Uri("ws://localhost:5137/ws")));
DesignInitializer.Init();

WinApplication.Run(new AppBoxDesign.HomePage());