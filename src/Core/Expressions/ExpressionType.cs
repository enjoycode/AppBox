namespace AppBoxCore;

public enum ExpressionType : byte
{
    ConstantExpression = 0,
    TypeExpression = 1,
    BinaryExpression = 2,
    NewExpression = 3,
    MemberAccessExpression = 4,
    MethodCallExpression = 5,
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

    //FormCreationExpression,
    //ArrayCreationExpression,
}