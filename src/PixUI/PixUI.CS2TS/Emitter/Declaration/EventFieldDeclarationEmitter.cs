using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    partial class Emitter
    {
        public override void VisitEventFieldDeclaration(EventFieldDeclarationSyntax node)
        {
            AddUsedModule("System"); //always use System module

            if (node.IsTSRawScript(out var script))
            {
                Write(script!);
                return;
            }

            WriteLeadingTrivia(node);
            WriteModifiers(node.Modifiers);

            var isAbstract = node.HasAbstractModifier();

            var type = node.Declaration.Type;
            if (type is NullableTypeSyntax nullableTypeSyntax)
                type = nullableTypeSyntax.ElementType;

            var typeSymbol = SemanticModel.GetSymbolInfo(type).Symbol;
            // check is System.Action type 并且最多只能有一个事件参数
            var isActionType = type is GenericNameSyntax
                ? SymbolEqualityComparer.Default.Equals(TypeOfAction1, typeSymbol?.OriginalDefinition)
                : SymbolEqualityComparer.Default.Equals(TypeOfAction, typeSymbol);
            if (!isActionType)
                throw new Exception("暂只支持最多一个事件参数");

            var eventName = node.Declaration.Variables[0].Identifier.Text;
            if (isAbstract)
            {
                Write("get ");
                Write(eventName);
                Write("(): ");
                WriteEventType(type);
                Write(';');
            }
            else
            {
                Write("readonly ");
                Write(eventName);
                Write(" = new ");
                WriteEventType(type);
                Write("();");
            }

            WriteTrailingTrivia(node);
        }

        private void WriteEventType(TypeSyntax eventType)
        {
            Write("System.Event");
            if (eventType is GenericNameSyntax genericNameSyntax)
            {
                Write('<');
                Visit(genericNameSyntax.TypeArgumentList.Arguments[0]);
                Write('>');
            }
        }
    }
}