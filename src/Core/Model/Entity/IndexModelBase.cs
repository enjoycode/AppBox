namespace AppBoxCore;

/// <summary>
    /// 系统存储及Sql存储的索引模型基类
    /// </summary>
    public abstract class IndexModelBase
    {
        public EntityModel Owner { get; private set; }
        public byte IndexId { get; private set; }
        public string Name { get; private set; }
        public bool Unique { get; private set; }
        public FieldWithOrder[] Fields { get; private set; }
        /// <summary>
        /// 索引覆盖字段
        /// </summary>
        public short[]? StoringFields { get; private set; }

        public bool HasStoringFields => StoringFields != null && StoringFields.Length > 0;

        public PersistentState PersistentState { get; private set; }

        #region ====Ctor====
        internal IndexModelBase() { }

        internal IndexModelBase(EntityModel owner, string name, bool unique,
            FieldWithOrder[] fields, short[]? storingFields = null)
        {
            Owner = owner;
            Name = name;
            Unique = unique;
            Fields = fields;
            StoringFields = storingFields;
        }
        #endregion

        #region ====Design Methods====
        internal void InitIndexId(byte id)
        {
            if (IndexId != 0)
                throw new Exception("IndexId has initialized");
            IndexId = id;
        }

        internal void AcceptChanges()
        {
            PersistentState = PersistentState.Unchanged;
        }

        internal void MarkDeleted()
        {
            PersistentState = PersistentState.Deleted;
            Owner.OnPropertyChanged();
            Owner.ChangeSchemaVersion();
        }
        #endregion

        #region ====导入方法====
        // internal void Import(EntityModel owner)
        // {
        //     Owner = owner;
        //     PersistentState = PersistentState.Detached;
        // }
        //
        // internal void UpdateFrom(IndexModelBase from)
        // {
        //     //TODO: fix this
        //     PersistentState = PersistentState.Modified;
        //     Log.Warn("导入索引暂未实现");
        // }
        #endregion
    }