using AppBoxCore;
using System.Data.Common;
using static AppBoxStore.StoreLogger;

namespace AppBoxStore.Utils;

internal static class EntityFetchUtil
{
    internal static async ValueTask FillEntity(SqlEntity entity, EntityModel model, DbDataReader row, int extendsFlag)
    {
        //填充实体成员
        for (var i = 0; i < row.FieldCount - extendsFlag; i++)
        {
            if (row.IsDBNull(i)) continue;

            await FillMember(model, entity, row.GetName(i).AsMemory(), row, i);
        }

        //需要改变实体持久化状态, //TODO: AcceptChanges for Navigation properties, FillMember return affects
        entity.AcceptChanges();
    }

    private static async ValueTask FillMember(EntityModel model, SqlEntity entity, ReadOnlyMemory<char> path,
        DbDataReader row, int clIndex)
    {
        while (true)
        {
            var indexOfDot = path.Span.IndexOf('.');
            if (indexOfDot < 0)
            {
                //忽略一些特殊字段
                if (path.Span == SqlStore.TREE_LEVEL) return;

                var member = model.GetMember(path.Span, false);
                if (member == null)
                {
                    //不存在通过反射处理, 如扩展的引用字段
                    Logger.Warn($"未找到实体成员{model.Name}.{path}");
                }
                else
                {
                    var reader = new SqlRowReader(row);
                    entity.ReadMember(member.MemberId, ref reader, clIndex);
                }
            }
            else
            {
                //eg: "Customer.Name" or "Customer.Address.City"
                var entityRefMemberName = path.Span[..indexOfDot];
                var memberModel = (EntityRefModel)model.GetMember(entityRefMemberName, true)!;
                if (memberModel.IsAggregationRef) throw new NotImplementedException("For Aggregation");

                var targetModel = await RuntimeContext.Current.GetModelAsync<EntityModel>(memberModel.RefModelIds[0]);
                var entityRefInstance = (SqlEntity)GetNaviPropForFetch(entity, memberModel.MemberId);
                model = targetModel;
                entity = entityRefInstance;
                path = path[(indexOfDot + 1)..];
                continue;
            }

            break;
        }
    }

    /// <summary>
    /// 初始化(读取或新建)实体的导航属性
    /// </summary>
    internal static object GetNaviPropForFetch(SqlEntity entity, short naviMemberId)
    {
        // 先判断是否已初始化过
        var memberValueGetter = new EntityMemberValueGetter();
        entity.WriteMember(naviMemberId, ref memberValueGetter, EntityMemberWriteFlags.None);
        if (!memberValueGetter.Value.IsEmpty)
            return memberValueGetter.Value.BoxedValue!;

        // 初始化导航属性的实例
        var initiator = new EntityNaviPropInitiator();
        entity.ReadMember(naviMemberId, ref initiator, EntityMemberWriteFlags.None);
        return initiator.NaviMemberValue;
    }
}