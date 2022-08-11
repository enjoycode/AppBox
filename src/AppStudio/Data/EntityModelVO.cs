using System;
using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxDesign
{
    public abstract class EntityMemberVO : IBinSerializable
    {
        public abstract EntityMemberType Type { get; }
        public short Id { get; set; }
        public string Name { get; set; }
        public bool AllowNull { get; set; }
        public string? Comment { get; set; }

#if __APPBOXDESIGN__
        protected void FetchFrom(EntityMemberModel model)
        {
            Id = model.MemberId;
            Name = model.Name;
            AllowNull = model.AllowNull;
            Comment = model.Comment;
        }

        public virtual void WriteTo(IOutputStream ws)
        {
            ws.WriteShort(Id);
            ws.WriteString(Name);
            ws.WriteBool(AllowNull);
            ws.WriteString(Comment);
        }

        public void ReadFrom(IInputStream rs) => throw new NotSupportedException();

#else
        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();
        
        public virtual void ReadFrom(IInputStream rs)
        {
            Id = rs.ReadShort();
            Name = rs.ReadString()!;
            AllowNull = rs.ReadBool();
            Comment = rs.ReadString();
        }

#endif
    }

    public sealed class EntityFieldVO : EntityMemberVO
    {
        public override EntityMemberType Type => EntityMemberType.EntityField;

        public EntityFieldType FieldType { get; set; }
        public long? EnumModelId { get; set; }
        public int Length { get; set; }
        public int Decimals { get; set; }

#if __APPBOXDESIGN__
        internal static EntityFieldVO From(EntityFieldModel model)
        {
            var vo = new EntityFieldVO();
            vo.FetchFrom(model);
            vo.FieldType = model.FieldType;
            if (model.FieldType == EntityFieldType.Enum)
                vo.EnumModelId = model.EnumModelId!.Value;
            vo.Length = model.Length;
            vo.Decimals = model.Decimals;
            return vo;
        }

        public override void WriteTo(IOutputStream ws)
        {
            base.WriteTo(ws);
            ws.WriteByte((byte)FieldType);
            if (FieldType == EntityFieldType.Enum)
                ws.WriteLong(EnumModelId!.Value);
            ws.WriteVariant(Length);
            ws.WriteVariant(Decimals);
        }

#else
        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            FieldType = (EntityFieldType)rs.ReadByte();
            if (FieldType == EntityFieldType.Enum)
                EnumModelId = rs.ReadLong();
            Length = rs.ReadVariant();
            Decimals = rs.ReadVariant();
        }

#endif
    }

    public sealed class EntityRefVO : EntityMemberVO
    {
        public override EntityMemberType Type => EntityMemberType.EntityRef;

        public bool IsReverse { get; set; }
        public bool IsAggregationRef { get; set; }
        public bool IsForeignKeyConstraint { get; set; }
        public readonly IList<long> RefModelIds = new List<long>();

#if __APPBOXDESIGN__
        internal static EntityRefVO From(EntityRefModel model)
        {
            var vo = new EntityRefVO();
            vo.FetchFrom(model);
            vo.IsReverse = model.IsReverse;
            vo.IsAggregationRef = model.IsAggregationRef;
            vo.IsForeignKeyConstraint = model.IsForeignKeyConstraint;
            foreach (var refModelId in model.RefModelIds)
            {
                vo.RefModelIds.Add(refModelId);
            }

            return vo;
        }

        public override void WriteTo(IOutputStream ws)
        {
            base.WriteTo(ws);

            ws.WriteBool(IsReverse);
            ws.WriteBool(IsAggregationRef);
            ws.WriteBool(IsForeignKeyConstraint);
            ws.WriteVariant(RefModelIds.Count);
            foreach (var refModelId in RefModelIds)
            {
                ws.WriteLong(refModelId);
            }
        }

#else
        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            IsReverse = rs.ReadBool();
            IsAggregationRef = rs.ReadBool();
            IsForeignKeyConstraint = rs.ReadBool();
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                RefModelIds.Add(rs.ReadLong());
            }
        }

#endif
    }

    public sealed class EntitySetVO : EntityMemberVO
    {
        public override EntityMemberType Type => EntityMemberType.EntitySet;

        public long RefModelId { get; set; }
        public short RefMemberId { get; set; }

#if __APPBOXDESIGN__
        internal static EntitySetVO From(EntitySetModel model)
        {
            var vo = new EntitySetVO();
            vo.FetchFrom(model);
            vo.RefModelId = model.RefModelId;
            vo.RefMemberId = model.RefMemberId;
            return vo;
        }

        public override void WriteTo(IOutputStream ws)
        {
            base.WriteTo(ws);

            ws.WriteLong(RefModelId);
            ws.WriteShort(RefMemberId);
        }
#else
        public override void ReadFrom(IInputStream rs)
        {
            base.ReadFrom(rs);
            RefModelId = rs.ReadLong();
            RefMemberId = rs.ReadShort();
        }
#endif
    }

    public sealed class EntityModelVO : IBinSerializable
    {
        public bool IsNew { get; set; }
        public readonly IList<EntityMemberVO> Members = new List<EntityMemberVO>();
        public DataStoreKind DataStoreKind { get; set; }

        private object? _storeOptions;

        public SqlStoreOptionsVO SqlStoreOptions => (SqlStoreOptionsVO)_storeOptions!;

#if __APPBOXDESIGN__
        public static EntityModelVO From(EntityModel model)
        {
            var vo = new EntityModelVO();
            vo.IsNew = model.PersistentState == PersistentState.Detached;
            vo.DataStoreKind = model.DataStoreKind;
            if (model.DataStoreKind == DataStoreKind.Sql) //TODO: others
                vo._storeOptions = SqlStoreOptionsVO.From(model.SqlStoreOptions!);
            
            //注意不向前端封送EntityRef的隐藏成员及删除的成员
            foreach (var memberModel in model.Members)
            {
                if (memberModel.PersistentState == PersistentState.Deleted)
                    continue;

                switch (memberModel.Type)
                {
                    case EntityMemberType.EntityField:
                        if (((EntityFieldModel)memberModel).IsForeignKey) continue;

                        vo.Members.Add(EntityFieldVO.From((EntityFieldModel)memberModel));
                        break;
                    case EntityMemberType.EntityRef:
                        vo.Members.Add(EntityRefVO.From((EntityRefModel)memberModel));
                        break;
                    case EntityMemberType.EntitySet:
                        vo.Members.Add(EntitySetVO.From((EntitySetModel)memberModel));
                        break;
                    default: throw new NotImplementedException();
                }
            }

            return vo;
        }

        public void WriteTo(IOutputStream ws)
        {
            ws.WriteBool(IsNew);
            ws.WriteByte((byte)DataStoreKind);
            // store options
            if (DataStoreKind == DataStoreKind.Sql) //TODO: others
                SqlStoreOptions.WriteTo(ws);
            
            // members
            ws.WriteVariant(Members.Count);
            foreach (var member in Members)
            {
                ws.WriteByte((byte)member.Type);
                member.WriteTo(ws);
            }
        }

        public void ReadFrom(IInputStream rs) => throw new NotSupportedException();
#else
        public void WriteTo(IOutputStream ws) => throw new NotSupportedException();

        public void ReadFrom(IInputStream rs)
        {
            IsNew = rs.ReadBool();
            DataStoreKind = (DataStoreKind)rs.ReadByte();
            //store options
            if (DataStoreKind == DataStoreKind.Sql)
            {
                var sqlStoreOptions = new SqlStoreOptionsVO();
                sqlStoreOptions.ReadFrom(rs);
                _storeOptions = sqlStoreOptions;
            }

            //members
            var count = rs.ReadVariant();
            for (var i = 0; i < count; i++)
            {
                var type = (EntityMemberType)rs.ReadByte();
                EntityMemberVO member;
                switch (type)
                {
                    case EntityMemberType.EntityField:
                        member = new EntityFieldVO();
                        break;
                    case EntityMemberType.EntityRef:
                        member = new EntityRefVO();
                        break;
                    case EntityMemberType.EntitySet:
                        member = new EntitySetVO();
                        break;
                    default: throw new NotImplementedException();
                }

                member.ReadFrom(rs);
                Members.Add(member);
            }
        }
#endif
    }
}