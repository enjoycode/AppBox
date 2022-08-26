using AppBoxCore;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace AppBoxDesign;

internal sealed class GetSignatures : IDesignHandler
{
    public async ValueTask<AnyValue> Handle(DesignHub hub, InvokeArgs args)
    {
        var targetId = args.GetString()!;
        var offset = args.GetInt();

        ModelId modelId = (long)ulong.Parse(targetId);
        var modelNode = hub.DesignTree.FindModelNode(modelId);
        if (modelNode == null)
            throw new Exception($"Can't find model: {modelId}");

        var doc = hub.TypeSystem.Workspace.CurrentSolution.GetDocument(modelNode.RoslynDocumentId!);
        if (doc == null)
            throw new Exception($"Can't find document: {modelNode.Model.Name}");

        var invocation = await GetInvocation(doc, offset);
        if (invocation == null)
            return AnyValue.Empty;

        var result = new SignatureResult();
        // define active parameter by position
        foreach (var comma in invocation.Separators)
        {
            if (comma.Span.Start > invocation.Position)
            {
                break;
            }

            result.ActiveParameter += 1;
        }

        // process all signatures, define active signature by types
        var signaturesSet = new HashSet<SignatureItem>();
        var bestScore = int.MinValue;
        SignatureItem? bestScoredItem = null;

        var types = invocation.ArgumentTypes;
        ISymbol? throughSymbol = null;
        ISymbol? throughType = null;
        var methodGroup = invocation.SemanticModel.GetMemberGroup(invocation.Receiver)
            .OfType<IMethodSymbol>();
        if (invocation.Receiver is MemberAccessExpressionSyntax)
        {
            var throughExpression = ((MemberAccessExpressionSyntax)invocation.Receiver).Expression;
            throughSymbol = invocation.SemanticModel.GetSpeculativeSymbolInfo(invocation.Position,
                throughExpression, SpeculativeBindingOption.BindAsExpression).Symbol;
            throughType = invocation.SemanticModel.GetSpeculativeTypeInfo(invocation.Position,
                throughExpression, SpeculativeBindingOption.BindAsTypeOrNamespace).Type;
            var includeInstance = (throughSymbol != null && !(throughSymbol is ITypeSymbol)) ||
                                  throughExpression is LiteralExpressionSyntax ||
                                  throughExpression is TypeOfExpressionSyntax;
            var includeStatic = (throughSymbol is INamedTypeSymbol) || throughType != null;
            methodGroup = methodGroup.Where(m =>
                (m.IsStatic && includeStatic) || (!m.IsStatic && includeInstance));
        }
        else if (invocation.Receiver is SimpleNameSyntax && invocation.IsInStaticContext)
        {
            methodGroup =
                methodGroup.Where(m => m.IsStatic || m.MethodKind == MethodKind.LocalFunction);
        }

        foreach (var methodOverload in methodGroup)
        {
            var signature = BuildSignature(methodOverload);
            signaturesSet.Add(signature);

            var score = InvocationScore(methodOverload, types);
            if (score > bestScore)
            {
                bestScore = score;
                bestScoredItem = signature;
            }
        }

        var signaturesList = signaturesSet.ToList();
        result.Signatures = signaturesList;
        result.ActiveSignature = signaturesList.IndexOf(bestScoredItem);

        return AnyValue.From(result);
    }

    private async Task<InvocationContext?> GetInvocation(Document document, int position)
    {
        var sourceText = await document.GetTextAsync();
        var tree = await document.GetSyntaxTreeAsync();
        var root = await tree!.GetRootAsync();
        var node = root.FindToken(position).Parent;

        // Walk up until we find a node that we're interested in.
        while (node != null)
        {
            if (node is InvocationExpressionSyntax invocation &&
                invocation.ArgumentList.Span.Contains(position))
            {
                var semanticModel = await document.GetSemanticModelAsync();
                return new InvocationContext(semanticModel!, position, invocation.Expression,
                    invocation.ArgumentList, invocation.IsInStaticContext());
            }

            if (node is ObjectCreationExpressionSyntax objectCreation &&
                objectCreation.ArgumentList!.Span.Contains(position))
            {
                var semanticModel = await document.GetSemanticModelAsync();
                return new InvocationContext(semanticModel!, position, objectCreation,
                    objectCreation.ArgumentList, objectCreation.IsInStaticContext());
            }

            if (node is AttributeSyntax attributeSyntax &&
                attributeSyntax.ArgumentList!.Span.Contains(position))
            {
                var semanticModel = await document.GetSemanticModelAsync();
                return new InvocationContext(semanticModel!, position, attributeSyntax,
                    attributeSyntax.ArgumentList, attributeSyntax.IsInStaticContext());
            }

            node = node.Parent;
        }

        return null;
    }

    private int InvocationScore(IMethodSymbol symbol, IEnumerable<TypeInfo> types)
    {
        var parameters = symbol.Parameters;
        if (parameters.Count() < types.Count())
        {
            return int.MinValue;
        }

        var score = 0;
        var invocationEnum = types.GetEnumerator();
        var definitionEnum = parameters.GetEnumerator();
        while (invocationEnum.MoveNext() && definitionEnum.MoveNext())
        {
            if (invocationEnum.Current.ConvertedType == null)
            {
                // 1 point for having a parameter
                score += 1;
            }
            else if (SymbolEqualityComparer.Default.Equals(invocationEnum.Current.ConvertedType,
                         definitionEnum.Current.Type))
            {
                // 2 points for having a parameter and being
                // the same type
                score += 2;
            }
        }

        return score;
    }

    private static SignatureItem BuildSignature(IMethodSymbol symbol)
    {
        var signature = new SignatureItem();
        signature.Documentation = symbol.GetDocumentationCommentXml();
        signature.Name = symbol.MethodKind == MethodKind.Constructor
            ? symbol.ContainingType.Name
            : symbol.Name;
        signature.Label = symbol.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat);
        //signature.StructuredDocumentation = DocumentationConverter.GetStructuredDocumentation(symbol);

        signature.Parameters = symbol.Parameters.Select(parameter => new SignatureParameter()
        {
            Name = parameter.Name,
            Label = parameter.ToDisplayString(SymbolDisplayFormat.MinimallyQualifiedFormat),
            //Documentation = signature.StructuredDocumentation.GetParameterText(parameter.Name)
        });

        return signature;
    }
}

internal sealed class SignatureResult
{
    public IEnumerable<SignatureItem> Signatures { get; set; }

    public int ActiveSignature { get; set; }

    public int ActiveParameter { get; set; }
}