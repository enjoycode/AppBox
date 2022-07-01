using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal static class SyntaxExtensions
    {
        /// <summary>
        /// 导出public及internal的类型定义
        /// </summary>
        internal static bool NeedExport(this BaseTypeDeclarationSyntax node, out bool isPublic)
        {
            isPublic = node.Modifiers.Any(m => m.Kind() == SyntaxKind.PublicKeyword);
            return isPublic || node.Modifiers.Any(m => m.Kind() == SyntaxKind.InternalKeyword);
        }

        internal static bool HasAbstractModifier(this MemberDeclarationSyntax node)
            => node.Modifiers.Any(m => m.Kind() == SyntaxKind.AbstractKeyword);

        internal static bool HasStaticModifier(this MemberDeclarationSyntax node)
            => node.Modifiers.Any(m => m.Kind() == SyntaxKind.StaticKeyword);

        internal static bool HasReadOnlyModifier(this MemberDeclarationSyntax node)
            => node.Modifiers.Any(m => m.Kind() == SyntaxKind.ReadOnlyKeyword);

        internal static bool IsVoidReturnType(this MethodDeclarationSyntax node)
        {
            if (node.ReturnType is not PredefinedTypeSyntax predefined) return false;
            return predefined.Keyword.Kind() == SyntaxKind.VoidKeyword;
        }

        internal static BaseTypeSyntax? GetBaseType(this ClassDeclarationSyntax node,
            SemanticModel semanticModel)
        {
            return node.BaseList?.Types
                .FirstOrDefault(t => t.IsClassType(semanticModel));
        }

        internal static TypeDeclarationSyntax? GetTypeDeclaration(this SyntaxNode node)
        {
            return node.AncestorsAndSelf()
                    .FirstOrDefault(n => n is TypeDeclarationSyntax)
                as TypeDeclarationSyntax;
        }

        /// <summary>
        /// Check SyntaxNode and ISymbol is in same source file.
        /// </summary>
        /// <param name="node">must in source file</param>
        internal static bool InSameSourceFile(this SyntaxNode node, ISymbol symbol)
        {
            return node.GetLocation().SourceTree!.FilePath ==
                   symbol.Locations[0].SourceTree?.FilePath;
        }

        /// <summary>
        /// Check SyntaxNode and ISymbol is in same TypeDeclarationSyntax.
        /// </summary>
        /// <param name="node">must in source file</param>
        internal static bool InSameType(this SyntaxNode node, ISymbol symbol)
        {
            if (symbol.DeclaringSyntaxReferences.IsEmpty) return false;
            var td1 = node.GetTypeDeclaration();
            if (td1 == null) return false;
            var td2 = symbol.DeclaringSyntaxReferences[0].GetSyntax().GetTypeDeclaration();
            return td1.Equals(td2);
        }

        /// <summary>
        /// 用于判断是否转换类型 eg:[TSType("Float32Array")] struct Color {}
        /// </summary>
        internal static bool IsTSType(this TypeDeclarationSyntax node, out string? tsType)
            => IsTSTypeInternal(node.AttributeLists, out tsType);

        internal static bool IsTSType(this BaseTypeDeclarationSyntax node, out string? tsType)
            => IsTSTypeInternal(node.AttributeLists, out tsType);

        private static bool IsTSTypeInternal(SyntaxList<AttributeListSyntax> attributes,
            out string? tsType)
        {
            //TODO:考虑排除非相关类
            tsType = null;
            var tsTypeAttribute = TryGetAttribute(attributes, Emitter.IsTSTypeAttribute);
            if (tsTypeAttribute == null) return false;

            tsType = tsTypeAttribute.ArgumentList!.Arguments[0].Expression.ToString();
            return true;
        }

        internal static bool IsTSInterfaceOf(this InterfaceDeclarationSyntax node) =>
            TryGetAttribute(node.AttributeLists, Emitter.IsTSInterfaceOfAttribute) != null;

        internal static bool IsTSRawScript(this MemberDeclarationSyntax node, out string? script)
        {
            script = null;
            var attribute = TryGetAttribute(node.AttributeLists, Emitter.IsTSRawScriptAttribute);
            if (attribute == null) return false;

            if (attribute.ArgumentList is not { Arguments: { Count: 1 } })
                throw new ArgumentException();

            var arg = attribute.ArgumentList.Arguments[0];
            if (arg.Expression is not LiteralExpressionSyntax literal)
                throw new ArgumentException();

            script = literal.Token.ValueText;
            return true;
        }

        /// <summary>
        /// 用于判断是否范型类型重载
        /// </summary>
        internal static bool IsGenericOverloadsType(this TypeDeclarationSyntax node) =>
            TryGetAttribute(node.AttributeLists, Emitter.IsTSGenericTypeOverloadsAttribute) != null;

        /// <summary>
        /// 用于判断是否不需要生成初始器方法
        /// </summary>
        internal static bool IsTSNoInitializer(this TypeDeclarationSyntax node) =>
            TryGetAttribute(node.AttributeLists, Emitter.IsTSNoInitializerAttribute) != null;

        internal static AttributeSyntax? TryGetAttribute(SyntaxList<AttributeListSyntax> attributes,
            Predicate<AttributeSyntax> checker)
        {
            if (attributes.Count == 0) return null;

            var attribute = attributes
                .SelectMany(t => t.Attributes)
                .SingleOrDefault(t => checker(t));

            return attribute;
        }
    }
}