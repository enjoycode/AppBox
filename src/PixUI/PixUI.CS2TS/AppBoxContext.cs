using System;

namespace PixUI.CS2TS
{
    /// <summary>
    /// 用于转换AppBox时的一些回调
    /// </summary>
    public sealed class AppBoxContext
    {
        public AppBoxContext(Func<string, string?> findModelId, Func<string, string, short> findEntityMemberId,
            bool forPreview, int sessionId
#if DEBUG
            , bool forViteDev = false
#endif
        )
        {
            FindModelId = findModelId;
            FindModel = fullName => FindModelId(fullName) != null;
            FindEntityMemberId = findEntityMemberId;
            ForPreview = forPreview;
            SessionId = sessionId;
#if DEBUG
            ForViteDev = forViteDev;
#endif
        }

        /// <summary>
        /// 用于跟踪使用到的模型
        /// </summary>
        internal readonly Func<string, bool> FindModel;

        internal readonly Func<string, string?> FindModelId;

        /// <summary>
        /// 用于查找实体成员的标识
        /// </summary>
        internal readonly Func<string, string, short> FindEntityMemberId;

        internal readonly bool ForPreview;

        internal readonly int SessionId;

#if DEBUG
        internal readonly bool ForViteDev;
#endif
    }
}