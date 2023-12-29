namespace AppBoxCore;

public enum ExpressionType : byte
{
    PrimitiveExpression = 0,
    TypeExpression = 1,
    BinaryExpression = 2,
    GroupExpression = 3,
    MemberAccessExpression = 4,
    //InvocationExpression,
    //LambdaExpression,
    //BlockExpression,
    //EventAction,
    //AssignmentExpression,
    //IdentifierExpression,
    //MemberAccessExpression,
    //IfStatementExpression,
    //LocalDeclaration,

    EntityExpression = 200,
    EntityFieldExpression,
    EntitySetExpression,
    KVFieldExpression,
    
    //AggregationRefFieldExpression,
    //EnumItemExpression,

    SubQueryExpression, //TODO: rename
    SelectItemExpression, //TODO: rename
    
    DbFuncExpression,
    DbParameterExpression,

    //FormCreationExpression,
    //ArrayCreationExpression,
}