using System;
using System.Diagnostics;
using System.Linq;
using System.Text;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis.CSharp.Syntax;

namespace SerializationGenerator
{
    [Generator]
    public class SourceGenerator : ISourceGenerator
    {
        private static readonly string[] SerializableAttributeNames =
        {
            "BinSerializable", "BinSerializableAttribute", "AppBoxCore.BinSerializable",
            "AppBoxCore.BinSerializableAttribute"
        };

        private static readonly string[] FieldAttributeNames =
        {
            "Field", "FieldAttribute", "AppBoxCore.Field", "AppBoxCore.FieldAttribute"
        };

        public void Initialize(GeneratorInitializationContext context)
        {
#if DEBUG
            if (!Debugger.IsAttached)
            {
                Debugger.Launch();
            }
#endif
            Debug.WriteLine("初始化序列化代码生成器");
        }

        public void Execute(GeneratorExecutionContext context)
        {
            var typeList = context.Compilation.SyntaxTrees
                .SelectMany(t => t.GetRoot().DescendantNodes().OfType<TypeDeclarationSyntax>())
                .Where(type => type.AttributeLists.Any(list => list.Attributes.Any(a =>
                    SerializableAttributeNames.Contains(a.Name.ToString()))));

            foreach (var type in typeList)
            {
                Debug.WriteLine($"开始生成{type.Identifier.Text}...");
                GenerateCode(type, context);
            }
        }

        private void GenerateCode(TypeDeclarationSyntax declaration,
            GeneratorExecutionContext context)
        {
            var semanticModel = context.Compilation.GetSemanticModel(declaration.SyntaxTree);
            var typeSymbol = semanticModel.GetDeclaredSymbol(declaration);
            if (typeSymbol == null) throw new ArgumentException("TypeSymbol is null");

            var sb = new StringBuilder(512);
            sb.Append("using System;\n");
            sb.Append("using AppBoxCore;\n\n");

            sb.Append($"namespace {typeSymbol.ContainingNamespace.ToDisplayString()}\n");
            sb.Append("{\n"); //begin namespace

            sb.Append($"\tpartial class {typeSymbol.Name} : IBinSerializable\n");
            sb.Append("\t{\n"); //begin class

            //Get fields
            var fields = declaration.ChildNodes()
                .Where(n => n is MemberDeclarationSyntax)
                .Cast<MemberDeclarationSyntax>()
                .Where(n => n is FieldDeclarationSyntax or PropertyDeclarationSyntax &&
                            n.AttributeLists.Any(list => list.Attributes.Any(a =>
                                FieldAttributeNames.Contains(a.Name.ToString()))))
                .Select(n => new
                {
                    Declaration = n,
                    Attribute = n.AttributeLists
                        .SelectMany(l => l.Attributes)
                        .First(a => FieldAttributeNames.Contains(a.Name.ToString()))
                })
                .Select(n => new
                {
                    IsNullable = GetFieldType(n.Declaration) is NullableTypeSyntax,
                    TypeName = GetTypeName(GetFieldType(n.Declaration), n.Attribute),
                    FieldName = GetFieldName(n.Declaration),
                    FieldId = n.Attribute.ArgumentList!.Arguments[0].Expression.ToString(),
                })
                .ToArray();


            //WriteTo
            sb.Append("\t\tpublic void WriteTo(IOutputStream ws)\n");
            sb.Append("\t\t{\n");
            foreach (var item in fields)
            {
                if (item.IsNullable)
                    sb.Append($"\t\tif ({item.FieldName} != null)\n");
                sb.Append($"\t\t\tws.WriteFieldId({item.FieldId}).Write{item.TypeName}({item.FieldName});\n");
            }

            sb.Append("\t\t}\n\n");


            //ReadFrom
            sb.Append("\t\tpublic void ReadFrom(IInputStream rs)\n");
            sb.Append("\t\t{\n");
            sb.Append("\t\t\twhile(true)\n");
            sb.Append("\t\t\t{\n");
            sb.Append("\t\t\t\tvar fieldId = rs.ReadFieldId();\n");
            sb.Append("\t\t\t\tswitch(fieldId)\n");
            sb.Append("\t\t\t\t{\n"); //begin switch
            foreach (var item in fields)
            {
                sb.Append($"\t\t\t\t\tcase {item.FieldId}: ");
                sb.Append($"{item.FieldName} = rs.Read{item.TypeName}(); break;\n");
            }

            sb.Append("\t\t\t\t\tcase 0: return;\n");
            sb.Append(
                "\t\t\t\t\tdefault: throw new SerializationException(SerializationError.ReadUnknownFieldId);\n");

            sb.Append("\t\t\t\t}\n"); //end switch
            sb.Append("\t\t\t}\n");
            sb.Append("\t\t}\n");


            sb.Append("\t}\n"); //end class
            sb.Append("}\n"); //end namespace

            context.AddSource($"{typeSymbol.Name}.g.cs", sb.ToString());
        }

        private static TypeSyntax GetFieldType(MemberDeclarationSyntax declaration)
        {
            if (declaration is FieldDeclarationSyntax fieldDeclarationSyntax)
            {
                return fieldDeclarationSyntax.Declaration.Type;
            }

            if (declaration is PropertyDeclarationSyntax propertyDeclarationSyntax)
            {
                return propertyDeclarationSyntax.Type;
            }

            throw new Exception();
        }

        private static string GetFieldName(MemberDeclarationSyntax declaration)
        {
            if (declaration is FieldDeclarationSyntax fieldDeclarationSyntax)
            {
                return fieldDeclarationSyntax.Declaration.Variables[0].Identifier.Text;
            }

            if (declaration is PropertyDeclarationSyntax propertyDeclarationSyntax)
            {
                return propertyDeclarationSyntax.Identifier.Text;
            }

            throw new Exception();
        }

        private static string GetTypeName(TypeSyntax typeSyntax, AttributeSyntax attribute)
        {
            if (attribute.ArgumentList!.Arguments.Count > 1 &&
                attribute.ArgumentList.Arguments[1].Expression.ToString() == "true")
            {
                return "Variant";
            }

            if (typeSyntax is NullableTypeSyntax nullableTypeSyntax)
                typeSyntax = nullableTypeSyntax.ElementType;

            if (typeSyntax is PredefinedTypeSyntax predefinedType)
                return GetPredefinedTypeName(predefinedType);

            throw new NotImplementedException($"{typeSyntax.ToString()}");
        }

        private static string GetPredefinedTypeName(PredefinedTypeSyntax predefinedType)
        {
            return predefinedType.Keyword.Kind() switch
            {
                SyntaxKind.StringKeyword => "String",
                SyntaxKind.CharKeyword => "Char",
                SyntaxKind.ByteKeyword => "Byte",
                SyntaxKind.SByteKeyword => "SByte",
                SyntaxKind.ShortKeyword => "Short",
                SyntaxKind.UShortKeyword => "UShort",
                SyntaxKind.IntKeyword => "Int",
                SyntaxKind.UIntKeyword => "UInt",
                SyntaxKind.FloatKeyword => "Float",
                SyntaxKind.DoubleKeyword => "Double",
                SyntaxKind.BoolKeyword => "Bool",
                SyntaxKind.ObjectKeyword => "Object",
                _ => throw new NotImplementedException($"Predefined Type: {predefinedType.Keyword}")
            };
        }
    }
}