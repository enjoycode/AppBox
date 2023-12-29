#if USE_FAST_EXPRESSION
global using LinqExpression = FastExpressionCompiler.LightExpression.Expression;
#else
global using LinqExpression = System.Linq.Expressions.Expression;
#endif