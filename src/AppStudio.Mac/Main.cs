using AppBoxDesign;
using AppBoxClient;
using PixUI.Platform.Mac;

PixUI.Render.Init(new PixUI.Drawing.Skia.SkiaRender());
Channel.Init(new WebSocketChannel(new Uri("ws://localhost:5000/ws")));
MacApplication.Run(new HomePage());