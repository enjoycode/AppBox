#if !__WEB__
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using PixUI.Platform;

namespace PixUI
{
    public sealed class FontCollection
    {
        public static readonly FontCollection Instance = new();

        private IntPtr _fontCollectionHandle;
        private IntPtr _assetFontMgrHandle;

        private readonly HashSet<string> _loading = new();
        private readonly Dictionary<string, Typeface> _loaded = new();

        internal IntPtr Handle => _fontCollectionHandle;

        public event Action? FontChanged;

        private FontCollection()
        {
            _assetFontMgrHandle = SkiaApi.sk_typeface_font_provider_new();
            _fontCollectionHandle = SkiaApi.sk_font_collection_new(_assetFontMgrHandle);
        }

        private void RegisterTypefaceToAsset(SKData data, string fontFamily)
        {
            var typeface = Typeface.FromData(data);
            if (typeface == null)
                return;

            SkiaApi.sk_typeface_font_provider_register_typeface(_assetFontMgrHandle,
                typeface.Handle);
#if DEBUG
            Console.WriteLine($"FontCollection.RegisterTypefaceToAsset: {typeface.FamilyName}");
#endif

            _loaded.Add(fontFamily, typeface);
            FontChanged?.Invoke();
        }

        // private static string GetFamilyName(IntPtr fontMgr, int index)
        // {
        //     using var str = new SKString();
        //     SkiaApi.sk_fontmgr_get_family_name(fontMgr, index, str.Handle);
        //     return (string)str;
        // }

        // private static SKTypeface? MatchFamily(IntPtr fontMgr, string familyName, SKFontStyle style)
        // {
        //     //TODO: find from cache first
        //
        //     if (style == null)
        //         throw new ArgumentNullException(nameof(style));
        //
        //     var tf = SKTypeface.GetObject(
        //         SkiaApi.sk_fontmgr_match_family_style(fontMgr, familyName, style.Handle));
        //     //TODO:check, skia doc mark must unref. tf?.PreventPublicDisposal();
        //     return tf;
        // }

        /// <summary>
        /// 仅从资源中匹配，目前仅用于加载Icon及Emoji字体
        /// </summary>
        public Typeface? TryMatchFamilyFromAsset(string familyName)
        {
            return _loaded.TryGetValue(familyName, out var typeface) ? typeface : null;
        }

        public bool StartLoadFontFromAsset(string asmName, string assetPath, string familyName)
        {
            if (!_loading.Add(familyName))
                return false;

            var context = SynchronizationContext.Current;
            Task.Run(() =>
            {
                var stream = AssetLoader.LoadAsStream(asmName, assetPath);
                if (stream == null) return;

                var data = SKData.Create(stream);
                stream.Dispose();
                context.Post(s => { RegisterTypefaceToAsset(data, familyName); }, null);
            });
            return true;
        }
    }
}
#endif