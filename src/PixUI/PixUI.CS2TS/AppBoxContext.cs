using System;

namespace PixUI.CS2TS
{
    /// <summary>
    /// 用于转换AppBox时的一些回调
    /// </summary>
    public sealed class AppBoxContext
    {
        public AppBoxContext(Func<string, bool> findModel, Func<string, string, short> findEntityMemberId)
        {
            FindModel = findModel;
            FindEntityMemberId = findEntityMemberId;
        }

        /// <summary>
        /// 用于跟踪使用到的模型
        /// </summary>
        internal readonly Func<string, bool> FindModel;
        
        /// <summary>
        /// 用于查找实体成员的标识
        /// </summary>
        internal readonly Func<string, string, short> FindEntityMemberId;
    }
}