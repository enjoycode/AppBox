#if USE_LINQ_EXPRESSION
global using LinqExpression = System.Linq.Expressions;
#else
global using LinqExpression = FastExpressionCompiler.LightExpression.Expression;
#endif