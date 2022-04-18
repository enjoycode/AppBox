import * as System from '@/System'
import * as PixUI from '@/PixUI'

export class Colors {
    public static readonly White: PixUI.Color = new PixUI.Color(255, 255, 255);
    public static readonly Black: PixUI.Color = new PixUI.Color(0, 0, 0);
    public static readonly Red: PixUI.Color = new PixUI.Color(255, 0, 0);
    public static readonly Blue: PixUI.Color = new PixUI.Color(0, 0, 255);
    public static readonly Green: PixUI.Color = new PixUI.Color(0, 255, 0);
    public static readonly Gray: PixUI.Color = new PixUI.Color(0xFF5F6368);

    private static _random: Nullable<System.Random>;

    public static Random(alpha: number = 255): PixUI.Color {
        Colors._random ??= new System.Random();
        let randomValue = (Math.floor((Colors._random.Next(0, 1 << 24) | (alpha << 24))) & 0xFFFFFFFF);
        return new PixUI.Color(randomValue);
    }
}
