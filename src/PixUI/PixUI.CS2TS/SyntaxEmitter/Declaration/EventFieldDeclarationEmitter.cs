using System;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class EventFieldDeclarationEmitter : SyntaxEmitter<EventFieldDeclarationSyntax>
    {
        internal static readonly EventFieldDeclarationEmitter Default = new();

        private EventFieldDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, EventFieldDeclarationSyntax node)
        {
            emitter.AddUsedModule("System"); //always use System module

            if (node.IsTSRawScript(out var script))
            {
                emitter.Write(script!);
                return;
            }

            emitter.WriteLeadingTrivia(node);
            emitter.WriteModifiers(node.Modifiers);

            var isAbstract = node.HasAbstractModifier();

            var type = node.Declaration.Type;
            if (type is NullableTypeSyntax nullableTypeSyntax)
                type = nullableTypeSyntax.ElementType;

            var typeSymbol = emitter.SemanticModel.GetSymbolInfo(type).Symbol;
            // check is System.Action type
            var isActionType = type is GenericNameSyntax
                ? SymbolEqualityComparer.Default.Equals(emitter.TypeOfAction1, typeSymbol?.OriginalDefinition)
                : SymbolEqualityComparer.Default.Equals(emitter.TypeOfAction, typeSymbol);
            if (!isActionType)
                throw new Exception("Only support System.Action now");

            var eventName = node.Declaration.Variables[0].Identifier.Text;
            if (isAbstract)
            {
                emitter.Write("get ");
                emitter.Write(eventName);
                emitter.Write("(): ");
                WriteEventType(emitter, type);
                emitter.Write(';');
            }
            else
            {
                emitter.Write("readonly ");
                emitter.Write(eventName);
                emitter.Write(" = new ");
                WriteEventType(emitter, type);
                emitter.Write("();");
            }

            emitter.WriteTrailingTrivia(node);
        }

        private static void WriteEventType(Emitter emitter, TypeSyntax eventType)
        {
            emitter.Write("System.Event");
            if (eventType is GenericNameSyntax genericNameSyntax)
            {
                emitter.Write('<');
                emitter.Visit(genericNameSyntax.TypeArgumentList.Arguments[0]);
                emitter.Write('>');
            }
        }
    }
}