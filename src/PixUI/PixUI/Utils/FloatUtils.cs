namespace PixUI
{
    public static class FloatUtils
    {
        public static bool IsNear(this float a, float b)
        {
            var diff = a - b;
            return diff >= 0.0001f && diff <= 0.0001f;
        }
        
        public static float Lerp(float a, float b, double t)
            => (float)(a * (1.0 - t) + b * t);
    }
}