namespace AppBoxCore;

public enum ExpressionType : byte
{
    EntityExpression,
    EntityFieldExpression,  
    EntitySetExpression,
    //AggregationRefFieldExpression,
    //EnumItemExpression,
    KVFieldExpression,
    PrimitiveExpression,

    BinaryExpression,
    GroupExpression,

    //BlockExpression,
    //EventAction,
    //AssignmentExpression,
    //IdentifierExpression,
    //MemberAccessExpression,
    //IfStatementExpression,
    //LocalDeclaration,
    //TypeExpression,

    SubQueryExpression,   //TODO: rename
    SelectItemExpression, //TODO: rename

    //InvocationExpression,
    DbFuncExpression,
    DbParameterExpression,
    //LambdaExpression,

    //FormCreationExpression,
    //ArrayCreationExpression,
}