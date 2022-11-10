using System;
using System.Collections.Generic;
using AppBoxCore;

namespace AppBoxStore;

public abstract class SqlQueryBase //: ISqlQueryJoin
{
    public string AliasName { get; set; } = null!;

    private IList<SqlJoin>? _joins;
    public bool HasJoins => _joins != null && _joins.Count > 0;
    public IList<SqlJoin> Joins => _joins ??= new List<SqlJoin>();
}