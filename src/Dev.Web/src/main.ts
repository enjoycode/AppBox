import {initializeSystem} from "@/System";
import * as PixUI from '@/PixUI'
import {Channel, initializeAppBoxClient, WebChannel} from '@/AppBoxClient';
import * as AppBoxDesign from './AppBoxDesign/Generated/HomePage'

// 初始化System
initializeSystem();
// 初始化AppBoxClient
initializeAppBoxClient();
// 初始化Channel
Channel.Init(new WebChannel());
// PixUI.PaintDebugger.Switch();
// 开始运行
PixUI.WebApplication.Run(() => new AppBoxDesign.HomePage());


