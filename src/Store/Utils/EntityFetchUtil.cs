using AppBoxCore;
using System.Data.Common;
using System;

namespace AppBoxStore.Utils
{
    internal static class EntityFetchUtil
    {
        internal static void FillEntity(SqlEntity entity, EntityModel model, DbDataReader row,
            int extendsFlag)
        {
            //填充实体成员
            for (var i = 0; i < row.FieldCount - extendsFlag; i++)
            {
                if (row.IsDBNull(i)) continue;

                FillMember(model, entity, row.GetName(i), row, i);
            }

            //需要改变实体持久化状态
            entity.FetchDone();
        }

        private static void FillMember(EntityModel model, SqlEntity entity, string path,
            DbDataReader row, int clIndex)
        {
            var indexOfDot = path.IndexOf('.');
            if (indexOfDot < 0)
            {
                var member = model.GetMember(path, false);
                if (member == null)
                {
                    //不存在通过反射处理, 如扩展的引用字段
                    Log.Warn($"未找到实体成员{model.Name}.{path}");
                }
                else
                {
                    var reader = new SqlRowReader(row);
                    entity.ReadMember(member.MemberId, ref reader, clIndex);
                }
            }
            else
            {
                throw new NotImplementedException();
            }
        }
    }
}