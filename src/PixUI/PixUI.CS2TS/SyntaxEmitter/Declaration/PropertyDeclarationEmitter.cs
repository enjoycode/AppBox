using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace PixUI.CS2TS
{
    internal sealed class PropertyDeclarationEmitter : SyntaxEmitter<PropertyDeclarationSyntax>
    {
        internal static readonly PropertyDeclarationEmitter Default = new();

        private PropertyDeclarationEmitter() { }

        internal override void Emit(Emitter emitter, PropertyDeclarationSyntax node)
        {
            if (node.HasAbstractModifier() || node.Parent is InterfaceDeclarationSyntax)
            {
                EmitAbstractProperty(emitter, node);
            }
            else if (IsAutoProperty(node, out var hasDifferentModifier, out var isReadonly))
            {
                if (hasDifferentModifier) //eg: public string Name {get; private set;}
                    EmitAutoProperty(emitter, node, false);
                else if (isReadonly) //eg: public string Name {get;}
                    EmitReadonlyAutoProperty(emitter, node);
                else
                    EmitAutoPropertyToField(emitter, node);
            }
            else
            {
                EmitGetterSetter(emitter, node);
            }
        }

        private static bool IsAutoProperty(PropertyDeclarationSyntax node,
            out bool hasDifferentModifier, out bool isReadonly)
        {
            hasDifferentModifier = false;
            isReadonly = node.ExpressionBody != null;
            if (node.AccessorList == null) return true;

            var hasModifier = false;
            var hasSetter = false;
            foreach (var item in node.AccessorList.Accessors)
            {
                if (item.Modifiers.Any())
                    hasModifier = true;
                if (item.Keyword.Text == "set")
                    hasSetter = true;

                if (item.Body != null || item.ExpressionBody != null)
                {
                    hasDifferentModifier = hasModifier;
                    return false;
                }
            }

            isReadonly = !hasSetter;
            hasDifferentModifier = hasModifier;
            return true;
        }

        private static void EmitField(Emitter emitter, PropertyDeclarationSyntax node,
            string fieldName)
        {
            emitter.Write(fieldName);
            if (node.Initializer != null && node.Initializer.Value.Kind() ==
                SyntaxKind.SuppressNullableWarningExpression)
            {
                //definite assignment assertion
                if (!node.HasStaticModifier()) //排除static
                    emitter.Write('!');
            }

            emitter.Write(": ");
            emitter.Visit(node.Type);

            if (node.Initializer != null)
            {
                if (node.Initializer.Value.Kind() != SyntaxKind.SuppressNullableWarningExpression)
                {
                    emitter.Write(" = ");
                    emitter.Visit(node.Initializer.Value);
                }
            }
            else
            {
                emitter.TryWriteDefaultValueForValueType(node.Type, node);
            }
        }

        private static void EmitAutoPropertyToField(Emitter emitter, PropertyDeclarationSyntax node)
        {
            emitter.WriteLeadingTrivia(node);
            emitter.WriteModifiers(node.Modifiers);

            EmitField(emitter, node, node.Identifier.Text);

            emitter.Write(';');
            emitter.WriteTrailingTrivia(node);
        }

        private static void EmitReadonlyAutoProperty(Emitter emitter, PropertyDeclarationSyntax node)
        {
            // eg: public string Name {get;}
            if (node.Initializer == null && node.ExpressionBody == null)
            {
                EmitAutoProperty(emitter, node, true);
                return;
            }

            // eg: public string Name {get;} => "Hello";
            emitter.WriteLeadingTrivia(node);
            emitter.WriteModifiers(node.Modifiers);

            emitter.Write("get ");
            emitter.Write(node.Identifier.Text);
            emitter.Write("(): ");
            emitter.Visit(node.Type);
            emitter.Write(" {");

            if (node.Initializer != null)
            {
                if (node.Initializer.Value.Kind() != SyntaxKind.SuppressNullableWarningExpression)
                {
                    emitter.Write(" return ");
                    emitter.Visit(node.Initializer.Value);
                }
                else
                {
                    emitter.Write(" throw new Error()");
                }
            }
            else if (node.ExpressionBody != null)
            {
                emitter.Write(" return ");
                emitter.Visit(node.ExpressionBody.Expression);
            }

            emitter.Write("; }");
            emitter.WriteTrailingTrivia(node);
        }

        private static void EmitAutoProperty(Emitter emitter, PropertyDeclarationSyntax node, bool forGetOnly)
        {
            var fieldName = $"#{node.Identifier.Text}";

            var isStatic = node.HasStaticModifier();

            emitter.WriteLeadingTrivia(node);
            if (isStatic)
                emitter.Write("static ");
            EmitField(emitter, node, fieldName);
            emitter.Write(";\n");

            foreach (var item in node.AccessorList!.Accessors)
            {
                emitter.WriteLeadingWhitespaceOnly(node);
                if (item.Modifiers.Any())
                {
                    emitter.WriteModifiers(item.Modifiers);
                    if (isStatic)
                        emitter.Write("static ");
                }
                else
                {
                    emitter.WriteModifiers(node.Modifiers);
                }

                if (item.Keyword.Kind() == SyntaxKind.GetKeyword)
                    EmitAutoPropertyGetter(emitter, node, isStatic, fieldName);
                else
                    EmitAutoPropertySetter(emitter, node, isStatic, fieldName);
            }

            if (forGetOnly)
            {
                emitter.WriteLeadingWhitespaceOnly(node);
                emitter.Write("private ");
                if (isStatic)
                    emitter.Write("static ");
                EmitAutoPropertySetter(emitter, node, isStatic, fieldName);
            }

            emitter.WriteTrailingTrivia(node);
        }

        private static void EmitAutoPropertyGetter(Emitter emitter, PropertyDeclarationSyntax node,
            bool isStatic, string fieldName)
        {
            emitter.Write("get ");
            emitter.Write(node.Identifier.Text);
            emitter.Write("() { return ");
            emitter.Write(isStatic ? node.GetTypeDeclaration()!.Identifier.Text : "this");
            emitter.Write('.');
            emitter.Write(fieldName);
            emitter.Write("; }\n");
        }

        private static void EmitAutoPropertySetter(Emitter emitter, PropertyDeclarationSyntax node,
            bool isStatic, string fieldName)
        {
            emitter.Write("set ");
            emitter.Write(node.Identifier.Text);
            emitter.Write("(value) {");
            emitter.Write(isStatic ? node.GetTypeDeclaration()!.Identifier.Text : "this");
            emitter.Write('.');
            emitter.Write(fieldName);
            emitter.Write(" = value; }");
        }

        private static void EmitGetterSetter(Emitter emitter, PropertyDeclarationSyntax node)
        {
            foreach (var item in node.AccessorList!.Accessors)
            {
                if (item.Keyword.Kind() == SyntaxKind.GetKeyword)
                {
                    emitter.WriteLeadingTrivia(node);
                    emitter.WriteModifiers(item.Modifiers.Any() ? item.Modifiers : node.Modifiers);

                    emitter.Write("get ");
                    emitter.Write(node.Identifier.Text);
                    emitter.Write("(): ");
                    emitter.Visit(node.Type);
                    if (item.ExpressionBody != null)
                    {
                        emitter.Write(" { return ");
                        emitter.Visit(item.ExpressionBody.Expression);
                        emitter.Write("; }\n");
                    }
                    else
                    {
                        emitter.Write('\n');
                        emitter.Visit(item.Body);
                    }
                }
                else
                {
                    emitter.WriteLeadingWhitespaceOnly(node);
                    emitter.WriteModifiers(item.Modifiers.Any() ? item.Modifiers : node.Modifiers);

                    emitter.Write("set ");
                    emitter.Write(node.Identifier.Text);
                    emitter.Write("(value");
                    if (!emitter.ToJavaScript)
                    {
                        emitter.Write(": ");
                        emitter.Visit(node.Type);
                    }

                    emitter.Write(')');
                    if (item.ExpressionBody != null)
                    {
                        emitter.Write(" { ");
                        emitter.Visit(item.ExpressionBody.Expression);
                        emitter.Write("; }");
                    }
                    else
                    {
                        emitter.Write('\n');
                        emitter.Visit(item.Body);
                    }
                }
            }
        }

        private static void EmitAbstractProperty(Emitter emitter, PropertyDeclarationSyntax node)
        {
            foreach (var item in node.AccessorList!.Accessors)
            {
                if (item.Keyword.Kind() == SyntaxKind.GetKeyword)
                {
                    emitter.WriteLeadingTrivia(node);
                    if (node.Parent is not InterfaceDeclarationSyntax)
                    {
                        emitter.WriteModifiers(item.Modifiers.Any()
                            ? item.Modifiers
                            : node.Modifiers);
                    }

                    emitter.Write("get ");
                    emitter.Write(node.Identifier.Text);
                    emitter.Write("(): ");
                    emitter.Visit(node.Type);
                    emitter.Write(";\n");
                }
                else
                {
                    emitter.WriteLeadingWhitespaceOnly(node);
                    if (node.Parent is not InterfaceDeclarationSyntax)
                    {
                        emitter.WriteModifiers(item.Modifiers.Any()
                            ? item.Modifiers
                            : node.Modifiers);
                    }

                    emitter.Write("set ");
                    emitter.Write(node.Identifier.Text);
                    emitter.Write("(value: ");
                    emitter.Visit(node.Type);
                    emitter.Write(");");
                }
            }

            emitter.WriteTrailingTrivia(node);
        }
    }
}