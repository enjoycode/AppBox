namespace AppBoxCore;

public enum ExpressionType : byte
{
    ConstantExpression = 0,
    ParameterExpression = 1,
    BinaryExpression = 2,
    NewExpression = 3,
    MemberExpression = 4,
    MethodCallExpression = 5,
    IndexExpression = 6,
    //LambdaExpression,
    //BlockExpression,
    //EventAction,
    //AssignmentExpression,
    //IdentifierExpression,
    //IfStatementExpression,
    //LocalDeclaration,

    AwaitExpression = 199,

    EntityExpression = 200,
    EntityFieldExpression,
    EntitySetExpression,
    //KVFieldExpression,
    //UnionRefFieldExpression,
    //EnumItemExpression,

    SubQueryExpression, //TODO: rename
    SelectItemExpression, //TODO: rename

    DbFuncExpression,
    DbParameterExpression,
}